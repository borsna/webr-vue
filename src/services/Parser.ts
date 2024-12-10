import { ref } from 'vue';
import { WebR } from 'webr';

class Parser {
  public webR = new WebR;

  public Parser() {
    this.webR.init();
    console.log("WebR initialized");
    console.log("WebR install packages");
    this.webR.installPackages(["DDIwR"], { 
      repos: [
        "https://repo.r-wasm.org", 
        "https://dusadrian.github.io/R-wasm/repo"
      ]
    });
  }

  public async parse(file: File) {
    try {
      
    } catch (e) {
      
    }
  }
}

export default  new Parser();