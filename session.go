package main

import (
	"context"
	"errors"
	"fmt"

	"github.com/chromedp/cdproto/cdp"
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
	if c.allocCtx == nil {
		return fmt.Errorf("allocator context is not initialized")
	}

	if c.ctx == nil {
		c.ctx, c.cancelFunc = chromedp.NewContext(c.allocCtx)
	}

	chromedp.ListenBrowser(c.ctx, func(ev interface{}) {
		chromedp.Run(c.ctx, c.whenBrowserOpen())
	})

	if err := chromedp.Run(c.ctx, chromedp.Navigate(url)); err != nil {
		return fmt.Errorf("failed to navigate to %s: %w", url, err)
	}

	return nil
}

func (c *Session) CloseBrowser() error {
	if c.ctx != nil {
		c.cancelFunc() // Cancel the allocator context
		c.ctx = nil
	}

	return nil
}

func (c *Session) GotoTarget(url string) error {
	if c.ctx == nil {
		c.ctx, c.cancelFunc = chromedp.NewContext(c.allocCtx)
		chromedp.ListenBrowser(c.ctx, func(ev interface{}) {
			chromedp.Run(c.ctx, c.whenBrowserOpen())
		})
	}

	return chromedp.Run(c.ctx, chromedp.Navigate(url))
}

func (c *Session) CloseSession() error {
	c.allocCancelFunc() // Cancel the allocator context
	c.allocCtx = nil

	return nil
}

func (c *Session) whenBrowserOpen() chromedp.ActionFunc {
	return chromedp.ActionFunc(func(ctx context.Context) error {
		chromedp.ListenBrowser(c.ctx, func(ev interface{}) {
			var userNameNode []*cdp.Node
			if err := chromedp.Nodes(`.user-info .name-box`, &userNameNode, chromedp.ByQuery).Do(ctx); err != nil {
				return
			}
			if len(userNameNode) == 0 {
				return
			}
			c.Name = userNameNode[0].NodeValue // Set the user name from the node value

			var iconNode []*cdp.Node
			if err := chromedp.Nodes(`.user-info img:first`, &iconNode, chromedp.ByQuery).Do(ctx); err != nil {
				return
			}

			if len(iconNode) == 0 {
				return
			}
			c.Icon = iconNode[0].AttributeValue("src") // Set the icon URL from the node attribute
			c.Signed = true                            // Mark the session as signed in
		})

		return nil
	})
}
