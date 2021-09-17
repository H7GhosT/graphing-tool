export class GraphingTool {
  /**
   *
   * @param {HTMLElement} $target
   * @param {{width: number, height: number}} options
   */
  constructor(
    $target,
    options = {
      width: 720,
      height: 500,
    }
  ) {
    this.$app = $target;
    this.width = options.width;
    this.height = options.height;

    this.$app.innerHTML = `
      <canvas id="graph-canvas"></canvas>
      <canvas id="hover-canvas"></canvas>

      <div class="pos-info"></div>
    `;

    this.$app.classList.add("graphing-tool-app");
    this.$app.style.setProperty("--height", height);
    this.$app.style.setProperty("--width", width);
  }
}
