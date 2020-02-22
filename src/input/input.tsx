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
  valueWatch(val: any) {
    this.valueDirtyForEmit = true;

    // check if value allow negatives or already has negative character (-)
    if (val.length && val.indexOf("-") === 0) {
      this.hasNegativeSymbol = true;
    } else if (val.length && val.indexOf("-") < 0) {
      this.hasNegativeSymbol = false;
    } else if (val.length && val.indexOf("-") > 0) {
      // remove the misplaced neagative
      const _newVal = val.replace("-", "");
      this.value = _newVal;
    }
  }

  @Prop() displayType?: "dollar" | "time" = "dollar";

  /**
   * If `true`, it will select the value of the input if focus. It is default to select/true.
   */
  @Prop() autoselect = true;

  /**
   * If set to false, it only accept non-negative values. Default to allow (-) character
   */
  @Prop() allowNegative = true;

  /**
   * If set to false, it will only allow whole numbers. Default to allow decimal/floating values
   */
  @Prop() allowDecimal = true;
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

  /**
   * A flag that monitor if the value already a negative character (-)
   */
  private hasNegativeSymbol = false;

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

    if (
      [46, 8, 9, 27, 13, 109, 110, 189, 190].indexOf(ev.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (ev.keyCode === 65 && (ev.ctrlKey || ev.metaKey)) ||
      // Allow: Ctrl+C
      (ev.keyCode === 67 && (ev.ctrlKey || ev.metaKey)) ||
      // Allow: Ctrl+V
      (ev.keyCode === 86 && (ev.ctrlKey || ev.metaKey)) ||
      // Allow: Ctrl+X
      (ev.keyCode === 88 && (ev.ctrlKey || ev.metaKey)) ||
      // Allow: home, end, left, right
      (ev.keyCode >= 35 && ev.keyCode <= 39)
    ) {
      // Tab = 9 and Enter = 13
      if (ev.keyCode === 9 || ev.keyCode === 13) {
        this.enterOrTab();
      }

      // allow only one decimal point (190 and 110 (numeric keyapad))
      if (ev.keyCode === 190 || ev.keyCode === 110) {
        if (this.getValue().indexOf(".") > -1) {
          ev.preventDefault();
        }
      }

      // allow only one negative '-' character (109, 189)
      if (ev.keyCode === 109 || ev.keyCode === 189) {
        if (!this.allowNegative || this.hasNegativeSymbol) {
          ev.preventDefault();
        }
      }

      // let it happen, (let the key do its default behaviour)
      return;
    }

    // make sure that it only allow numbers
    if (
      (ev.shiftKey || ev.keyCode < 48 || ev.keyCode > 57) &&
      (ev.keyCode < 96 || ev.keyCode > 105)
    ) {
      ev.preventDefault();
    }

    // allow 0-9 digits
    if (
      (ev.keyCode >= 48 && ev.keyCode <= 57) ||
      (ev.keyCode >= 96 && ev.keyCode <= 105)
    ) {
      const _currVal: string = this.getValue();
      const _nextVal: string = _currVal.concat(ev.key);

      if (!this.allowDecimal) {
        // no decimal is allowed
        const rxNoDec: RegExp = new RegExp(/^\d*$/g);
        if (_nextVal && !String(_nextVal).match(rxNoDec) && !this.hasFocus) {
          ev.preventDefault();
        }
      }
    }
  };

  private enterOrTab() {
    if (this.valueDirtyForEmit) {
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
