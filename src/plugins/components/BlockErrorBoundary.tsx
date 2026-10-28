import { Component } from "react";
import { Button } from "../../components/Button";
import type { ReactNode } from "react";

interface BlockErrorBoundaryProps {
  children: ReactNode;
  identity: unknown;
  resetKey?: unknown;
}

interface BlockErrorBoundaryState {
  error: Error | null;
  identity: unknown;
  resetKey?: unknown;
}

export class BlockErrorBoundary extends Component<BlockErrorBoundaryProps, BlockErrorBoundaryState> {
  state: BlockErrorBoundaryState = { error: null, identity: this.props.identity, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<BlockErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(props: BlockErrorBoundaryProps, state: BlockErrorBoundaryState): Partial<BlockErrorBoundaryState> | null {
    return props.identity !== state.identity || props.resetKey !== state.resetKey ? { error: null, identity: props.identity, resetKey: props.resetKey } : null;
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <div className="ree-plugin-error" role="alert"><p>{this.state.error.message}</p><Button onClick={() => this.setState({ error: null })}>Retry</Button></div>;
  }
}
