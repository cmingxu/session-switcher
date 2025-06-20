package main

import (
	"errors"
	"fmt"
)

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) PassData() []string {
	return []string{" Hello", "World"}
}

func (a *App) CreateSession() (*Session, error) {
	if a.manager == nil {
		return nil, errors.New("manager is not initialized")
	}

	session, err := a.manager.CreateSession()
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return session, nil
}

func (a *App) GetSession(uid string) (*Session, error) {
	return a.manager.GetSession(uid)
}

func (a *App) RenameSession(uid, name string) error {
	if a.manager == nil {
		return errors.New("manager is not initialized")
	}

	session, err := a.manager.GetSession(uid)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	session.Name = name

	return a.manager.Save()
}

func (a *App) GetSessions() []*Session {
	return a.manager.GetSessions()
}

func (a *App) DeleteSession(uid string) error {
	return a.manager.DeleteSession(uid)
}

func (a *App) OpenBrowser(uid, url string) error {
	if a.manager == nil {
		return errors.New("manager is not initialized")
	}

	session, err := a.manager.GetSession(uid)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	return session.OpenBrowser(url)
}

func (a *App) GotoTarget(uid, url string) error {
	if a.manager == nil {
		return errors.New("manager is not initialized")
	}

	session, err := a.manager.GetSession(uid)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	return session.GotoTarget(url)
}

func (a *App) CloseBrowser(uid string) error {
	if a.manager == nil {
		return errors.New("manager is not initialized")
	}

	session, err := a.manager.GetSession(uid)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	return session.CloseBrowser()
}
