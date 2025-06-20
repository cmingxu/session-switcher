package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/chromedp/chromedp"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/samber/lo"
)

var (
	// raised when a session already exists
	ErrSessionAlreadyExists = errors.New("session already exists")
	// raised when a session does not exist
	ErrSessionNotFound = errors.New("session not found")
)

type Manager struct {
	dataDir         string // Data directory for the manager
	sessionMetaPath string

	sessions []*Session
	mu       sync.RWMutex
}

func NewManger(dataDir string) *Manager {
	manager := &Manager{
		mu:              sync.RWMutex{},
		sessions:        make([]*Session, 0),
		dataDir:         dataDir,
		sessionMetaPath: filepath.Join(dataDir, "session_meta.json"),
	}

	return manager
}

func (m *Manager) CreateSession() (*Session, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	randomUUID := uuid.NewString()[:8]
	session := &Session{
		Uid:     randomUUID,
		Name:    "New Session",
		DataDir: filepath.Join(m.dataDir, "session", randomUUID),
	}

	opts := chromedp.DefaultExecAllocatorOptions[:]
	opts = append(opts, chromedp.Flag("headless", false)) // Disable GPU for headless mode
	if err := session.initAllocatorCtx(session.DataDir, opts...); err != nil {
		return nil, err
	}

	m.sessions = append(m.sessions, session)

	if err := m.save(); err != nil {
		return nil, err
	}

	return session, nil
}

func (m *Manager) DeleteSession(uid string) error {
	log.Info().Msgf("Deleting session with UID: %s, session cnt before Deleting %d", uid, len(m.sessions))

	m.mu.Lock()
	defer m.mu.Unlock()

	if _, found := lo.Find(m.sessions, func(s *Session) bool { return s.Uid == uid }); !found {
		return ErrSessionNotFound
	}

	m.sessions = lo.Filter(m.sessions, func(s *Session, _ int) bool {
		return s.Uid != uid
	})

	os.RemoveAll(filepath.Join(m.dataDir, "session", uid))

	return m.save()
}

func (m *Manager) GetSession(uid string) (*Session, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	session, found := lo.Find(m.sessions, func(s *Session) bool { return s.Uid == uid })
	if !found {
		return nil, ErrSessionNotFound
	}

	return session, nil
}

func (m *Manager) GetSessions() []*Session {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return m.sessions
}

func (m *Manager) Save() error {
	return m.save()
}

func (m *Manager) save() error {
	metafile, err := os.OpenFile(m.sessionMetaPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer metafile.Close()

	if err := json.NewEncoder(metafile).Encode(m.sessions); err != nil {
		return err
	}

	return nil
}

func (m *Manager) LoadAndResumeSession() error {
	log.Info().Msgf("Loading session metadata from %s", m.sessionMetaPath)

	if _, err := os.Stat(m.sessionMetaPath); os.IsNotExist(err) {
		return nil // No sessions to load
	}
	sessions := make([]*Session, 0)

	jsonFile, err := os.Open(m.sessionMetaPath)
	if err != nil {
		return err
	}
	defer jsonFile.Close()

	log.Info().Msgf("Loading session metadata from %s", m.sessionMetaPath)

	if err := json.NewDecoder(jsonFile).Decode(&sessions); err != nil {
		return err
	}

	opts := chromedp.DefaultExecAllocatorOptions[:]
	opts = append(opts, chromedp.Flag("headless", false)) // Disable GPU for headless mode
	for _, session := range sessions {
		if err := session.initAllocatorCtx(session.DataDir, opts...); err != nil {
			log.Error().Msgf("initAllocatorCtx for session %s failed: %v", session.Uid, err)
			continue // Skip this session if initialization fails
		}

		m.sessions = append(m.sessions, session)
	}

	m.sessions = sessions

	fmt.Printf("Loaded %d sessions from metadata\n", len(m.sessions))
	log.Info().Msgf("Loaded %d sessions from metadata", len(m.sessions))
	return nil
}
