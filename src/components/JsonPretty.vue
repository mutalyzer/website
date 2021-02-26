<template>
  <vue-json-pretty
    :data="summary"
    :deep="deep"
    :show-double-quotes="showDoubleQuotes"
    :show-length="showLength"
    :show-line="showLine"
    :highlight-mouseover-node="highlightMouseoverNode"
    :collapsed-on-click-brackets="collapsedOnClickBrackets"
    :custom-value-formatter="
      useCustomLinkFormatter ? customLinkFormatter : null
    "
    @click="handleClick"
  >
  </vue-json-pretty>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

export default {
  name: "JsonPretty",
  components: {
    VueJsonPretty,
  },
  props: {
    summary: null,
  },
  data() {
    return {
      selectableType: "single",
      showSelectController: true,
      showLength: false,
      showLine: true,
      showDoubleQuotes: true,
      highlightMouseoverNode: true,
      highlightSelectedNode: true,
      selectOnClickNode: true,
      collapsedOnClickBrackets: true,
      useCustomLinkFormatter: false,
      deep: 7,
    };
  },
  methods: {
    handleClick(path, data, treeName = "") {
      console.log("click: ", path, data, treeName);
      this.itemPath = path;
      this.itemData = !data ? data + "" : data;
    },
  },
};
</script>
