<template>
  <div>
    <v-progress-linear indeterminate v-if="progress"></v-progress-linear>

    <ViewVariantsCore
      v-if="view && !progress"
      :view="view"
      :d_id="'name_check_' + d_type"
    />
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import ViewVariantsCore from "../components/ViewVariantsCore.vue";

export default {
  name: "ViewVariants",
  components: {
    ViewVariantsCore,
  },
  props: {
    description: null,
    only_variants: null,
    sequence: null,
    d_type: null,
  },
  data() {
    return {
      view: [],
      progress: true,
    };
  },
  created: function () {
    this.get_variants();
  },
  methods: {
    get_variants: function () {
      if (this.description && !this.only_variants && !this.sequence) {
        MutalyzerService.view(this.description).then((response) => {
          this.progress = false;
          if (response.data) {
            this.view = response.data;
          }
        });
      } else if (this.description && this.only_variants && this.sequence) {
        MutalyzerService.view(this.description, {
          only_variants: this.only_variants,
          sequence: this.sequence,
        }).then((response) => {
          this.progress = false;
          if (response.data) {
            this.view = response.data;
          }
        });
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
<style scoped>
.wrapper {
  overflow-x: auto;
  white-space: nowrap;
  margin-top: 5px;
  margin-left: 5px;
  padding: 5px;
  background-color: var(--grey-lighten-5);
}

.variant {
  font-family: monospace;
  margin-top: 15px;
  padding: 5px;
  background-color: var(--blue-grey-lighten-5);
}

.seq-variant {
  background-color: var(--blue-grey-lighten-5);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq {
  letter-spacing: 2px;
  text-indent: 2px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 auto;
  font-family: monospace;
  color: #000000;
}

.seq-elem {
  text-align: center;
}

.seq-elem:hover {
  background-color: #b8b8b8;
  cursor: pointer;
}

.seqdel {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #b71c1c;
}

.seqins {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #1c1fb7;
}
</style>
