<template>
  <div>
    <v-sheet v-if="rna.errors">
      <v-alert
        color="red lighten-1"
        tile
        border="left"
        dark
        v-for="(error, index) in rna.errors"
        :key="index"
      >
        <div>
          {{ getMessage(error) }}
        </div>
      </v-alert>
    </v-sheet>

    <div class="mt-4 mb-4" v-if="rna.description">
      <Description
        :description="rna.description"
        :css_class="'ok-description-link'"
        :to_name="'NormalizerAlt'"
        :to_params="{ descriptionRouter: rna.description }"
      />
    </div>

    <div class="wrapper" id="parent-div">
      <!-- Supremal representations -->
      <div class="variant-div">
        <span v-for="(supremal, index) in rna.local_supremals" :key="index">
          <span :class="spanClass(supremal)">{{
            supremal.supremal.coding[0]
          }}</span>
        </span>
      </div>

      <!-- Minimal descriptions -->
      <div class="variant-div">
        <span v-for="(supremal, index) in rna.local_supremals" :key="index">
          <span :class="spanClass(supremal)">
            <span
              :class="spanPartClass(supremal)"
              v-for="(description, index_d) in minimalDescriptions(supremal)"
              :key="index_d"
            >
              {{ description }}</span
            >
          </span>
        </span>
      </div>

      <v-divider class="mt-5"></v-divider>

      <!-- Rna descriptions -->
      <div class="variant-div">
        <span v-for="(supremal, index) in rna.local_supremals" :key="index">
          <span class="variant-span">
            <span
              v-for="(rna_part, index_rna_part) in supremal.rna"
              :key="index_rna_part"
            >
              <span class="variant-span-part">{{ rna_part }}</span></span
            >
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Description from "../components/Description.vue";

export default {
  name: "Rna",
  components: {
    Description,
  },
  props: {
    rna: null,
  },
  data() {
    return {
      reference: [],
      predicted: [],
    };
  },
  methods: {
    toList: function (input) {
      let output = [];
      for (let v of input) {
        output.push(v);
      }
      return output;
    },
    minimalDescriptions: function (supremal) {
      if (supremal.push_exon && !supremal.push_intron) {
        return this.toList(supremal.push_exon.coding);
      } else if (!supremal.push_exon && supremal.push_intron) {
        return this.toList(supremal.push_intron.coding);
      }
      return this.toList(supremal.hgvs.coding);
    },
    spanClass: function (supremal) {
      if (supremal.splice_affected) {
        return "variant-span-affected";
      } else {
        return "variant-span";
      }
    },
    spanPartClass: function (supremal) {
      if (supremal.splice_affected) {
        if (
          (supremal.push_exon && !supremal.push_intron) ||
          (!supremal.push_exon && supremal.push_intron)
        ) {
          return "variant-span-part-fixed";
        }
        return "variant-span-part-affected";
      } else {
        return "variant-span-part";
      }
    },
    outputVariants: function (variants) {
      if (variants.length == 1) {
        return variants[0];
      }
      return variants.join(";");
    },
    getMessage: function (message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
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
  padding: 5px;
}

.variant-div {
  font-family: monospace;
  margin-top: 25px;
  padding: 10px;
  word-break: break-all;
  /* background-color: var(--blue-grey-lighten-5); */
}
.variant-span {
  font-family: monospace;
  padding: 15px;
  padding: 17px 10px 17px 10px;
  margin: 10px;
  background-color: var(--blue-grey-lighten-5);
}
.variant-span-affected {
  font-family: monospace;
  padding: 15px;
  padding: 17px 10px 17px 10px;
  margin: 10px;
  background-color: var(--red-lighten-4);
}

.variant-span-part {
  font-family: monospace;
  padding: 5px;
  margin: 5px;
  background-color: var(--blue-grey-lighten-4);
}
.variant-span-part-affected {
  font-family: monospace;
  padding: 5px;
  margin: 5px;
  background-color: var(--red-lighten-4);
}

.variant-span-part-fixed {
  font-family: monospace;
  padding: 5px;
  margin: 5px;
  background-color: var(--green-lighten-4);
}
</style>
