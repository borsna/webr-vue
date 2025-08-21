<script setup>
import { ref } from 'vue';
import { WebR } from 'webr';

const ddi = ref('');
const csv = ref('');
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

      // write to the webR filesystem
      await webR.FS.writeFile('/home/web_user/' + file.name, new Uint8Array(e.target.result));
      console.debug('File uploaded and written to /home/web_user/'+file.name);
      console.info('run convert with DDIwR...');

      // run the DDIwR conversion to extract DDI-C 2.6 metadata
      await webR.evalR(`DDIwR::convert("`+file.name+`", to="DDI", embed=FALSE)`);
      
      console.debug('Files done, reading...');
      
      // read the DDI-C 2.6 XML file from the webR filesystem
      ddi.value = new TextDecoder().decode(
        await webR.FS.readFile('/home/web_user/'+basename+'.xml')
      );

      // read the CSV file from the webR filesystem
      csv.value = new TextDecoder().decode(
        await webR.FS.readFile('/home/web_user/'+basename+'.csv')
      );

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
    <input 
      type="file" 
      accept=".sav,.dta,.sas7bdat" 
      @change="handleFileChange" />
  </div>
  <div v-if="state=='loading' || state=='init'" id="loading"></div>

  <div v-if="state=='done'" class="card">
    <h2>DDI-C 2.6</h2>
    <highlightjs 
      :code="ddi" 
      language="xml" 
      class="outputbox" />

    <h2>CSV</h2>
    <highlightjs 
      :code="csv" 
      language="csv" 
      class="outputbox" />
  </div>
</template>