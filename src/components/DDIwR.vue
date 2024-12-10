<script setup>
import { ref } from 'vue';
import { WebR } from 'webr';

const ddi = ref('');
const state = ref('none');

const webR = new WebR();
webR.init();

webR.installPackages(["DDIwR"], { 
  repos: [
    "https://repo.r-wasm.org", 
    "https://dusadrian.github.io/R-wasm/repo"
  ]
});

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    const basename  = file.name.substr(0,file.name.lastIndexOf('.'));

    reader.onload = async (e) => {
      state.value = 'loading';
      const contents = e.target.result;
      await webR.FS.writeFile('/home/web_user/' + file.name, new Uint8Array(contents));
      console.log('File uploaded and written to /home/web_user/'+file.name);
      console.log('run convert with DDIwR...');

      let result = await webR.evalR(`DDIwR::convert("`+file.name+`", to="DDI", embed=FALSE)`);
      let output = await result;
      console.log('Files done, reading...', output);
      
      var readDdiResult = await webR.FS.readFile('/home/web_user/'+basename+'.xml');
      var ddiString = new TextDecoder().decode(readDdiResult);
      ddi.value = ddiString;

      console.log('DONE!');
      state.value = 'done';
    };

    await reader.readAsArrayBuffer(file);
  }
};
</script>

<template>
  <h1>DDIwR in WebR test</h1>
  <div class="card">
    <h2>Data file</h2>
    <input type="file" accept=".sav,.dta,.sas7bdat" @change="handleFileChange">
  </div>
  <div v-if="state=='loading'" id="loading"></div>

  <div v-if="state=='done'" class="card">
    <h2>DDI-C 2.6</h2>
    <pre class="no-wrap" style="border: 1px solid gray;padding:0.25rem">{{ ddi }}</pre>
  </div>
</template>

<style scoped>
.no-wrap {
  overflow-x: auto;
}

#loading {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(55,55,55,.3);
  border-radius: 50%;
  border-top-color: #222;
  animation: spin 1s ease-in-out infinite;
  -webkit-animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}
@-webkit-keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}
</style>