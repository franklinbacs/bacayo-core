import {
  Component,
  Host,
  h,
  Prop,
  EventEmitter,
  Event,
  State,
  Watch
} from "@stencil/core";

@Component({
  tag: "fcb-input",
  styleUrl: "input.scss",
  shadow: true
})
export class InputComponent {
  private didBlurAfterEdit = false;
  private nativeInput?: HTMLInputElement;
  private valueDirtyForEmit = false;

  @State() hasFocus = false;

  /**
   * If `true`, the value will be cleared after focus upon edit.
   */
  @Prop() clearOnEdit?: boolean;

  /**
   * If `true`, the user cannot modify the value.
   */
  @Prop() readonly = false;

  /**
   * If `true`, the user cannot intercat with the input.
   */
  @Prop() disabled = false;

  @Prop({ mutable: true }) value?: string | null = "";

  @Watch("value")
  valueWatch() {
    this.valueDirtyForEmit = true;
  }

  @Prop() displayType?: "dollar" | "time" = "dollar";

  /**
   * If `true`, it will select the value of the input if focus. It is default to select/true.
   */
  @Prop() autoselect = true;
  /**
   * Event emitted on keyboard input.
   */
  @Event() fcbInput!: EventEmitter<KeyboardEvent>;

  /**
   * Emitted when the input loses focus.
   */
  @Event() fcbBlur!: EventEmitter<void>;

  /**
   * Emitted when the input as focus.
   */
  @Event() fcbFocus!: EventEmitter<void>;

  /**
   * Emitted when ENTER or TAB key is pressed, returns the current value.
   */
  @Event() fcbEnter!: EventEmitter<any>;

  private pattern(p: string): string {
    let result = "";
    switch (p) {
      case "patter1":
        result = "/^-?(0|[1-9]d*)(.d+)?$/";
        break;

      default:
        break;
    }

    return result;
  }

  private shouldClearOnEdit() {
    return this.clearOnEdit === undefined ? false : this.clearOnEdit;
  }

  private getValue(): string {
    return this.value || "";
  }

  private hasValue(): boolean {
    return this.getValue().length > 0;
  }

  private clearTextInput = (ev?: Event) => {
    if (!this.readonly && !this.disabled && ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    this.value = "";

    /**
     * This is needed for clearOnEdit
     * Otherwise the value will not be cleared
     * if user is inside the input
     */
    if (this.nativeInput) {
      this.nativeInput.value = "";
    }
  };

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | null;
    if (input) {
      this.value = input.value || "";
    }

    this.fcbInput.emit(ev as KeyboardEvent);
  };

  private onKeydown = (ev: KeyboardEvent) => {
    if (this.shouldClearOnEdit()) {
      // check if the input value change after it was blured and edited
      if (this.didBlurAfterEdit && this.hasValue()) {
        // clear the input
        this.clearTextInput();
      }

      // reset flag
      this.didBlurAfterEdit = false;
    }

    // allow only valid numeric characters and other acceptable keys
    const code = ev.keyCode;
    let isValid = false;

    if (this.isSysKey(code) || code === 8 || code === 46) {
        isValid = true;
    }

    if (ev.shiftKey || ev.altKey || ev.ctrlKey) {
        isValid = true ;
    }

    if (code >= 48 && code <= 57) {
      isValid = true;
    }

    if (code >= 96 && code <= 105) {
      isValid = true;
    }

    if (isValid) {
      this.enterOrTab(ev)
    } else {
       ev.preventDefault();
       ev.stopPropagation();
      } 
  };

  private isSysKey(code) {
    if (code === 40 || code === 38 ||
            code === 13 || code === 39 || code === 27 ||
            code === 35 ||
            code === 36 || code === 37 || code === 38 ||
            code === 16 || code === 17 || code === 18 ||
            code === 20 || code === 37 || code === 9 ||
            code === 190 || code == 110 ||    // decimal points
            code === 8 ||                     // backspace
            (code >= 112 && code <= 123)) 
            {
        return true;
    }

    return false;
}

  private enterOrTab(ev: KeyboardEvent) {
    // check if keycode is ENTER or TAB then emit value
    const ENTER = 13;
    const TAB = 9;

    if ((ev.keyCode === ENTER || ev.keyCode === TAB) && this.valueDirtyForEmit) {
        const val = this.getValue() ? +this.getValue() : 0;
        this.fcbEnter.emit({ value: val });
        this.valueDirtyForEmit = false;
    }
  }

  private focusChanged(): void {
    // If clearOnEdit is enabled and the input blurred but has value, set a flag
    if (!this.hasFocus && this.shouldClearOnEdit() && this.hasValue()) {
      this.didBlurAfterEdit = true;
    }
  }

  private onBlur = () => {
    this.hasFocus = false;
    this.focusChanged();

    this.fcbBlur.emit();
  };

  private onFocus = () => {
    this.hasFocus = true;
    this.focusChanged();

    this.fcbFocus.emit();

    // if has value then select
    if (this.getValue()) {
      this.nativeInput.select();
    }
  };

  render() {
    const value = this.getValue();
    return (
      <Host
        class={{
          "has-focus": this.hasFocus
        }}
      >
        <input
          class="native-input"
          ref={input => (this.nativeInput = input)}
          disabled={this.disabled}
          readOnly={this.readonly}
          type="text"
          pattern={this.pattern("patter1")}
          value={value}
          onInput={this.onInput}
          onBlur={this.onBlur}
          onKeyDown={this.onKeydown}
          onFocus={this.onFocus}
        />
      </Host>
    );
  }
}
