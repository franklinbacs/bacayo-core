import { Component, Prop, Host, h, Watch } from "@stencil/core";

@Component({
    tag: "fcb-spinner",
    styleUrl: "spinner.scss"
})
export class SpinnerComponent {
    /**
     * If `true`, then spinner will show.
     */
    @Prop() show = false;
    @Watch('show')

    render() {
        return (
            <Host
            class={{
                'show': this.show,
                'hide': !this.show
                }}>
                <div  class="logo">
                <span class="loading"></span>
                </div>
            </Host>
        );
    }
}