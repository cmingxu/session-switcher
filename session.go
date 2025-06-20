package main

import (
	"context"
	"errors"
	"fmt"

	"github.com/chromedp/chromedp"
)

var (
	ExecAllocatorCtxAlreadyExists = errors.New("exec allocator context already exists")
)

const (
	LoginFormUrl = "https://www.xiaohongshu.com/explore"
)

type Session struct {
	Uid     string `json:"uid"`  // Handle string
	Name    string `json:"name"` // User name
	Handle  string `json:"handle"`
	Icon    string `json:"icon"`    // Icon URL
	DataDir string `json:"dataDir"` // Data directory for the session
	Signed  bool   `json:"signed"`  // Indicates if the session is signed in

	allocCtx        context.Context    // Context for the allocator
	allocCancelFunc context.CancelFunc // Cancel function for the allocator context

	ctx        context.Context    // Context for the session
	cancelFunc context.CancelFunc // Cancel function for the session context
}

func (c *Session) initAllocatorCtx(dataDir string, opts ...chromedp.ExecAllocatorOption) error {
	if c.allocCancelFunc != nil {
		return ErrSessionAlreadyExists
	}

	opts = append(opts, chromedp.UserDataDir(dataDir)) // Set user data directory
	c.allocCtx, c.allocCancelFunc = chromedp.NewExecAllocator(context.Background(), opts...)

	return nil
}

func (c *Session) OpenBrowser(url string) error {
	// create context
	if c.allocCtx == nil {
		return fmt.Errorf("allocator context is not initialized")
	}

	if c.ctx == nil {
		c.ctx, c.cancelFunc = chromedp.NewContext(c.allocCtx)
	}

	// run task list
	if err := chromedp.Run(c.ctx,
		chromedp.Navigate(url),
	); err != nil {
		return fmt.Errorf("Failed getting body of %s: %v", LoginFormUrl, err)
	}

	return nil
}

func (c *Session) CloseBrowser() error {
	c.cancelFunc() // Cancel the allocator context
	c.ctx = nil

	return nil
}

func (c *Session) CloseSession() error {
	c.allocCancelFunc() // Cancel the allocator context
	c.allocCtx = nil

	return nil
}
