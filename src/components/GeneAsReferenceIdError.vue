<template>
  <v-sheet class="pt-10 pr-10 pb-8 pl-10" color="orange lighten-5">
    <div>
      <p>
        Reference
        <code>{{ error.gene }}</code>
        has been identified as a gene on chromosome
        <code>{{ error.chr_ids }}</code
        >, but this gene has multiple associated transcripts.
      </p>
      <p class="mt-4 font-weight-medium">
        Did you mean one of the following descriptions?
      </p>
      <div>
        <v-sheet
          v-for="assembly_id in getOrderedAssemblies(error.options)"
          :key="assembly_id"
          outlined
          class="pa-4 my-4"
        >
          <div class="text-subtitle-1 font-weight-medium mb-2">
            {{ assembly_id }}
          </div>
          <Description
            v-for="(option, ind) in getVisibleOptions(
              error.options[assembly_id],
              assembly_id,
            )"
            :key="ind"
            :description="option.description"
            css_class="other-description-link"
            :to_name="'Normalizer'"
            :to_params="{ descriptionRouter: option.description }"
            :tag="convertOptionToTag(option)"
          />
          <v-btn
            v-if="
              getHiddenCount(error.options[assembly_id], assembly_id) > 0 ||
              expandedAssemblies[assembly_id]
            "
            text
            small
            color="primary"
            class="text-uppercase mt-2"
            @click="
              $set(
                expandedAssemblies,
                assembly_id,
                !expandedAssemblies[assembly_id],
              )
            "
          >
            {{
              expandedAssemblies[assembly_id]
                ? "Show less"
                : `Show ${getHiddenCount(error.options[assembly_id], assembly_id)} more`
            }}
            <v-icon right small>{{
              expandedAssemblies[assembly_id]
                ? "mdi-chevron-up"
                : "mdi-chevron-down"
            }}</v-icon>
          </v-btn>
        </v-sheet>
      </div>
    </div>
  </v-sheet>
</template>

<script>
import Description from "./Description.vue";

export default {
  name: "GeneAsReferenceIdError",
  components: {
    Description,
  },
  props: {
    error: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      expandedAssemblies: {},
    };
  },
  methods: {
    getOrderedAssemblies(options) {
      const order = ["GRCH38", "T2T", "GRCH37"];
      return order.filter((assembly) => assembly in options);
    },
    getSortedOptions(options) {
      if (!options) return [];
      return [...options].sort((a, b) => {
        if (a.tag && !b.tag) return -1;
        if (!a.tag && b.tag) return 1;
        if (a.description > b.description) return -1;
        if (a.description < b.description) return 1;
        return 0;
      });
    },
    getVisibleOptions(options, assembly_id) {
      const sorted = this.getSortedOptions(options);
      if (this.expandedAssemblies[assembly_id]) {
        return sorted;
      }
      const tagged = sorted.filter((opt) => opt.tag);
      const untagged = sorted.filter((opt) => !opt.tag);
      const limit = Math.max(2, tagged.length);
      return [...tagged, ...untagged.slice(0, limit - tagged.length)];
    },
    getHiddenCount(options, assembly_id) {
      const total = options.length;
      const visible = this.getVisibleOptions(options, assembly_id).length;
      return total - visible;
    },
    convertOptionToTag(option) {
      if (!option.tag || !option.transcript_id) {
        return null;
      }

      return {
        id: option.transcript_id,
        details: option.tag,
      };
    },
  },
};
</script>
