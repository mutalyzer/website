<template>
  <div>
    <div class="overline">Affected Protein Description</div>
    <div>
      <Description
        :description="protein.description"
        :css_class="'ok-description-link'"
        :to_name="'Normalizer'"
        :to_params="{ descriptionRouter: protein.description }"
      />
    </div>
    <div class="overline">Affected Protein Reference Sequence</div>
    <div class="protein-seq">
      <span class="protein-equal">{{ reference[0].seq }}</span>
      <span class="protein-diff">{{ reference[1].seq }}</span>
      <span class="protein-equal">{{ reference[2].seq }}</span>
    </div>
    <div class="overline">Affected Protein Predicted Sequence</div>
    <div class="protein-seq">
      <span class="protein-equal">{{ predicted[0].seq }}</span>
      <span class="protein-diff">{{ predicted[1].seq }}</span>
      <span class="protein-equal">{{ predicted[2].seq }}</span>
    </div>
  </div>
</template>

<script>
import Description from "../components/Description.vue";

export default {
  name: "AffectedProtein",
  components: {
    Description,
  },
  props: {
    protein: null,
  },
  data() {
    return {
      reference: [],
      predicted: [],
    };
  },
  created: function () {
    [this.reference, this.predicted] = this.getParts(this.protein);
  },
  methods: {
    reverseString(s) {
      return s.split("").reverse().join("");
    },
    getParts(protein) {
      let r = protein.reference;
      let p = protein.predicted;
      var r_prefix = r;
      var p_prefix = p;
      var r_middle = "";
      var p_middle = "";
      var r_suffix = "";
      var p_suffix = "";

      if (
        "position_first" in protein &&
        "position_last_original" in protein &&
        "position_last_predicted" in protein
      ) {
        r_prefix = r.slice(0, protein.position_first);
        p_prefix = p.slice(0, protein.position_first);

        r_middle = r.slice(
          protein.position_first,
          protein.position_last_original
        );
        r_suffix = r.slice(protein.position_last_original, r.length);

        p_middle = p.slice(
          protein.position_first,
          protein.position_last_predicted
        );
        p_suffix = p.slice(protein.position_last_predicted, p.length);
      }

      return [
        [
          { seq: r_prefix, type: "equal" },
          { seq: r_middle, type: "diff" },
          { seq: r_suffix, type: "equal" },
        ],

        [
          { seq: p_prefix, type: "equal" },
          { seq: p_middle, type: "diff" },
          { seq: p_suffix, type: "equal" },
        ],
      ];
    },
  },
};
</script>
<style scoped src="../assets/main.css"></style>
<style lang="scss" scoped>
.protein-description {
  text-decoration: none;
  margin: 0;
  padding: 2px;
  font-family: monospace;
  display: inline;

  color: #004d40;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.protein-seq {
  margin-left: 5px;
  padding: 10px;
  text-decoration: none;
  font-family: monospace;
  display: block;
  color: #004d40;
  background-color: #efefef;
  overflow-wrap: break-word;
}

.protein-equal {
  margin: 0;
  padding: 0;
  text-decoration: none;
  font-family: monospace;
  display: inline;
  color: #000000;
  overflow-wrap: break-word;
}

.protein-diff {
  margin: 0;
  padding: 0;
  text-decoration: none;
  font-family: monospace;
  display: inline;
  font-weight: bold;
  color: #990000;
  overflow-wrap: break-word;
}
</style>
