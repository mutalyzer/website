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
    [this.reference, this.predicted] = this.getParts(
      this.protein.reference,
      this.protein.predicted
    );
  },
  methods: {
    reverseString(s) {
      return s.split("").reverse().join("");
    },
    getPrefix(s1, s2) {
      var i;
      var prefix = "";
      for (i = 0; i < Math.max(s1.length, s2.length); i++) {
        if (s1[i] != s2[i]) {
          break;
        } else {
          prefix += s1[i];
        }
      }
      return prefix;
    },
    getSuffix(s1, s2) {
      var i;
      var suffix = "";
      for (i = 0; i < Math.max(s1.length, s2.length); i++) {
        if (s1[s1.length - i - 1] != s2[s2.length - i - 1]) {
          break;
        } else {
          suffix += s1[s1.length - i - 1];
        }
      }
      return this.reverseString(suffix);
    },
    getParts(r, p) {
      if (r == p || p == "?") {
        this.reference.push({ seq: r, type: "equal" });
        this.predicted.push({ seq: p, type: "equal" });

        this.reference.push({ seq: "", type: "diff" });
        this.predicted.push({ seq: "", type: "diff" });

        this.reference.push({ seq: "", type: "equal" });
        this.predicted.push({ seq: "", type: "equal" });

        return;
      }

      var prefix = this.getPrefix(r, p);
      var suffix = this.getSuffix(r, p);

      var r_middle = r.slice(prefix.length, r.length - suffix.length);
      var p_middle = p.slice(prefix.length, p.length - suffix.length);

      let common_length = prefix.length + suffix.length - r.length;
      if (common_length > 0) {
        p_middle = p.slice(prefix.length, prefix.length + common_length);
        suffix = suffix.slice(common_length, suffix.length);
      }

      return [
        [
          { seq: prefix, type: "equal" },
          { seq: r_middle, type: "diff" },
          { seq: suffix, type: "equal" },
        ],

        [
          { seq: prefix, type: "equal" },
          { seq: p_middle, type: "diff" },
          { seq: suffix, type: "equal" },
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
