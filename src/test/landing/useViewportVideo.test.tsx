import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useViewportVideo } from "@/hooks/useViewportVideo";

describe("useViewportVideo Hook (Spec 015, TASK-03)", () => {
  let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
  let mockObserve: any;
  let mockDisconnect: any;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    class MockIntersectionObserver {
      constructor(cb: any) {
        observerCallback = cb;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa el observer y controla play() / pause() según isIntersecting", () => {
    let playCalled = false;
    let pauseCalled = false;

    function VideoTestComponent() {
      const { videoRef } = useViewportVideo();

      React.useEffect(() => {
        if (videoRef.current) {
          videoRef.current.play = vi.fn().mockImplementation(() => {
            playCalled = true;
            return Promise.resolve();
          });
          videoRef.current.pause = vi.fn().mockImplementation(() => {
            pauseCalled = true;
          });
        }
      }, [videoRef]);

      return <video ref={videoRef} data-testid="test-video" />;
    }

    const { unmount, getByTestId } = render(<VideoTestComponent />);
    const videoEl = getByTestId("test-video") as HTMLVideoElement;

    expect(mockObserve).toHaveBeenCalledWith(videoEl);

    // 1. Simular entrada en viewport (isIntersecting = true)
    act(() => {
      observerCallback?.([
        {
          target: videoEl,
          isIntersecting: true,
        },
      ]);
    });

    expect(playCalled).toBe(true);

    // 2. Simular salida del viewport (isIntersecting = false)
    act(() => {
      observerCallback?.([
        {
          target: videoEl,
          isIntersecting: false,
        },
      ]);
    });

    expect(pauseCalled).toBe(true);

    // 3. Desmontar
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
