package main

import (
	"context"

	"github.com/rs/zerolog"
)

// App struct
type App struct {
	ctx     context.Context
	manager *Manager // Manager for handling sessions
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	a.manager = NewManger("/tmp")

	if err := a.manager.LoadAndResumeSession(); err != nil {
		println("Failed to load session manager:", err)
	}
}
