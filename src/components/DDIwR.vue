<script setup>
import { ref } from 'vue';
import { WebR } from 'webr';

const ddi = ref('');
const state = ref('init');

const webR = new WebR();
webR.init();

console.info('Installing DDIwR package...');
webR.installPackages(["DDIwR"]).then(() => {
  console.info('DDIwR package installed!');
  state.value = 'idle';
});

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    const basename  = file.name.substr(0, file.name.lastIndexOf('.'));

    reader.onload = async (e) => {
      state.value = 'loading';
      const contents = e.target.result;
      // write to the webR filesystem
      await webR.FS.writeFile('/home/web_user/' + file.name, new Uint8Array(contents));
      console.debug('File uploaded and written to /home/web_user/'+file.name);
      console.info('run convert with DDIwR...');

      // run the DDIwR conversion to extract DDI-C 2.6 metadata
      let result = await webR.evalR(`DDIwR::convert("`+file.name+`", to="DDI", embed=FALSE)`);
      let output = await result;
      console.debug('Files done, reading...');
      
      // read the DDI-C 2.6 XML file from the webR filesystem
      var readDdiResult = await webR.FS.readFile('/home/web_user/'+basename+'.xml');
      var ddiString = new TextDecoder().decode(readDdiResult);
      ddi.value = ddiString;

      console.info('DDI-C 2.6 metadata extracted successfully!');
      state.value = 'done';
    };

    await reader.readAsArrayBuffer(file);
  }
};
</script>

<template>
  <h1>DDIwR in WebR test</h1>
  <div v-if="state!='init'" class="card">
    <h2>Data file</h2>
    <input type="file" accept=".sav,.dta,.sas7bdat" @change="handleFileChange">
  </div>
  <div v-if="state=='loading' || state=='init'" id="loading"></div>

  <div v-if="state=='done'" class="card">
    <h2>DDI-C 2.6</h2>
    <highlightjs :code="ddi" language="xml" style="border: 1px solid gray;padding:0.25rem;border-radius: 0.2rem;"></highlightjs>
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