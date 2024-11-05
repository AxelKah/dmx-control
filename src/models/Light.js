class Light {
    constructor(id, channel, startAddress, color = "#fff", containerId = "container1", intensity = 99) {
      this.id = id;
      this.selected = false;
      this.color = color;
      this.containerId = containerId;
      this.channel = channel;
      this.startAddress = startAddress;
      this.intensity = intensity;
    }
  }
  
  export default Light;