import type { PreviewBufferAction, PreviewBufferState } from "./types";

export function createPreviewBuffer(): PreviewBufferState {
  return { frames: [null, null], front: null, failure: null };
}

export function previewBufferReducer(state: PreviewBufferState, action: PreviewBufferAction): PreviewBufferState {
  switch (action.type) {
    case "generated": {
      const match = action.force ? -1 : state.frames.findIndex((frame) => frame && frame.status !== "failed" && frame.html === action.snapshot.html && frame.width === action.snapshot.width);
      const target = match < 0 ? (state.front === 0 ? 1 : 0) : match;
      const frames: PreviewBufferState["frames"] = [...state.frames];
      frames[target] = match < 0 ? action.snapshot : { ...frames[target]!, source: action.snapshot.source };
      const ready = frames[target]?.status === "ready";
      return { frames, front: ready ? target : state.front, failure: ready ? null : state.failure };
    }
    case "ready": {
      const index = state.frames.findIndex((frame) => frame && frame.id === action.id && frame.status === "loading");
      // 以加载身份匹配；复用中的旧回调可以完成当前缓冲，已替换或失败的加载不能复活。
      if (index < 0) return state;
      const frames: PreviewBufferState["frames"] = [...state.frames];
      frames[index] = { ...frames[index]!, status: "ready" };
      const current = frames[index]?.source === action.source;
      return { frames, front: current ? index : state.front, failure: current ? null : state.failure };
    }
    case "failed": {
      if (action.id === undefined) {
        const frames: PreviewBufferState["frames"] = [state.frames[0], state.frames[1]];
        for (const index of [0, 1] as const) {
          const frame = frames[index];
          if (frame?.status === "loading") frames[index] = { ...frame, status: "failed" };
        }
        return { ...state, frames, failure: action.failure };
      }
      const index = state.frames.findIndex((frame) => frame && frame.id === action.id && frame.status === "loading");
      if (index < 0) return state;
      const frames: PreviewBufferState["frames"] = [...state.frames];
      frames[index] = { ...frames[index]!, status: "failed" };
      return { ...state, frames, failure: frames[index]?.source === action.failure.source ? action.failure : state.failure };
    }
  }
}
