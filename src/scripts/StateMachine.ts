interface StateConfig {
    name?: string
    onEnter?: () => void
    onUpdate?: (deltaTime: number) => void
    onExit?: () => void
};

export default class StateMachine {
    private context?: any;
    private name: string;
    private currentState?: StateConfig;
    private isSwitchingState = false;
    private stateQueue: string[] = [];
    private states = new Map<string, StateConfig>();
    private paused = false;

    constructor (context?: any, name?: string) {
        this.context = context;
        this.name = name ?? 'ra8bit';
    }

    isCurrentState(name: string) {
        if (!this.currentState) {
            return false;
        }
        return this.currentState.name === name;
    }

    addState(name: string, config?: StateConfig) {
        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(this.context),
            onUpdate: config?.onUpdate?.bind(this.context),
            onExit: config?.onExit?.bind(this.context),
        })
        return this;
    }

    setState(name: string) {

     
        if (!this.states.has(name)) {
            console.log("No such state",name);
            return;
        }

        if (this.isSwitchingState) {
            this.stateQueue.push(name);
            return;
        }

        this.isSwitchingState = true;

        if (this.currentState && this.currentState.onExit) {
            this.currentState.onExit();
        }

        this.currentState = this.states.get(name);

        if (this.currentState?.onEnter) {
            this.currentState?.onEnter();
        }

        this.isSwitchingState = false;

        return this;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    getCurrentState() {
        return this.currentState?.name;
    }

    update(deltaTime: number) {

        if(this.paused)
            return; // this statemachine interferes with parallel scenes

        if (this.stateQueue.length > 0) {
            const name = this.stateQueue.shift()!;
            this.setState(name);
            return;
        }

        if (!this.currentState) {
            return
        }
        if (this.currentState.onUpdate) {
            this.currentState.onUpdate(deltaTime);
            
        }
    }

    destroy() {
        this.states.clear();
    }

}