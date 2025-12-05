<template>
  <v-sheet class="pt-10 pr-10 pb-8 pl-10" color="orange lighten-5">
    <div>
      <p>
        Intronic
        {{ positionCount === 1 ? "position" : "positions" }}
        {{ positionCount === 1 ? "was" : "were" }}
        identified:
      </p>

      <v-list dense class="orange lighten-5 py-0">
        <v-list-item
          v-for="(positions, ref_id) in error.positions"
          :key="ref_id"
          class="align-start px-0"
        >
          <v-list-item-icon class="mt-1 mr-2" style="min-width: 20px">
            <v-icon small>mdi-circle-small</v-icon>
          </v-list-item-icon>
          <v-list-item-content class="py-1">
            <v-list-item-title
              class="text-body-2 font-weight-regular"
              style="white-space: normal"
            >
              <span v-if="positions.length === 1">
                The position <code>{{ positions[0] }}</code> is intronic and
                cannot be interpreted with the transcript reference sequence
                <code>{{ ref_id }}</code
                >, which does not include intronic regions.
              </span>
              <span v-else-if="positions.length === 2">
                The positions <code>{{ positions[0] }}</code> and
                <code>{{ positions[1] }}</code> are intronic and cannot be
                interpreted with the transcript reference sequence
                <code>{{ ref_id }}</code
                >, which does not include intronic regions.
              </span>
              <span v-else>
                The positions
                <code>{{ positions.slice(0, -1).join(", ") }}</code>
                and
                <code>{{ positions[positions.length - 1] }}</code> are intronic
                and cannot be interpreted with the transcript reference sequence
                <code>{{ ref_id }}</code
                >, which does not include intronic regions.
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <p class="mt-3">
        Intronic positions require a genomic reference sequence, e.g.
        <code>NC_*(NM_*)</code>.
      </p>

      <p class="mt-4 font-weight-medium">
        Did you mean one of the following descriptions?
      </p>

      <div>
        <v-sheet
          v-for="(s_d, ind) in error.suggestions"
          :key="ind"
          outlined
          class="pa-4 my-4"
        >
          <div class="text-subtitle-1 font-weight-medium mb-2">
            {{ s_d.assembly_id }}
          </div>

          <div class="mb-3">
            <Description
              :description="s_d.description"
              css_class="other-description-link"
              :to_name="'Normalizer'"
              :to_params="{ descriptionRouter: s_d.description }"
            />
          </div>

          <v-divider class="my-3"></v-divider>

          <div class="text-caption grey--text text--darken-1 mb-1">
            Reference sequence compatibility:
          </div>

          <div
            v-for="(mapping, ref_id) in assemblies[s_d.assembly_id]"
            :key="ref_id"
            class="text-body-2 mb-1"
          >
            <v-icon
              v-if="mapping && !mapping.slices_differ"
              small
              color="success"
              class="mr-1"
            >
              mdi-check-circle
            </v-icon>
            <v-icon
              v-else-if="mapping && mapping.slices_differ"
              small
              color="warning"
              class="mr-1"
            >
              mdi-alert-circle
            </v-icon>

            <span v-if="mapping && !mapping.slices_differ">
              The exonic sequence of <code>{{ ref_id }}</code>
              is identical to
              <code>{{ mapping.chr_id }}({{ ref_id }})</code>.
              <v-tooltip v-if="mapping.tag && mapping.tag.details" bottom>
                <template #activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs"
                    color="blue darken-1"
                    text-color="blue darken-1"
                    outlined
                    label
                    x-small
                    class="ml-1"
                    v-on="on"
                  >
                    {{ mapping.tag.details }}
                  </v-chip>
                </template>
                <span>{{ tagTooltip(mapping.tag) }}</span>
              </v-tooltip>
            </span>

            <span v-else-if="mapping && mapping.slices_differ">
              The exonic sequence of <code>{{ ref_id }}</code>
              differs from
              <code>{{ mapping.chr_id }}({{ ref_id }})</code>.
              <v-tooltip v-if="mapping.tag && mapping.tag.details" bottom>
                <template #activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs"
                    color="blue darken-1"
                    text-color="blue darken-1"
                    outlined
                    label
                    x-small
                    class="ml-1"
                    v-on="on"
                  >
                    {{ mapping.tag.details }}
                  </v-chip>
                </template>
                <span>{{ tagTooltip(mapping.tag) }}</span>
              </v-tooltip>
            </span>
          </div>
        </v-sheet>
      </div>
    </div>
  </v-sheet>
</template>

<script>
import Description from "./Description.vue";

export default {
  name: "IntronicPositionError",
  components: {
    Description,
  },
  props: {
    error: {
      type: Object,
      required: true,
    },
    assemblies: {
      type: Object,
      required: true,
    },
  },
  computed: {
    positionCount() {
      let count = 0;
      for (let ref_id in this.error.positions) {
        count += this.error.positions[ref_id].length;
      }
      return count;
    },
  },
  methods: {
    tagTooltip(tag) {
      if (!tag || !tag.details) {
        return "";
      }
      const tagDetails = tag.details.toLowerCase();
      if (tagDetails.includes("mane")) {
        return `${tag.id} is a ${tag.details} representative transcript as part of the MANE project.`;
      } else if (tagDetails.includes("refseq select")) {
        return `${tag.id} is a ${tag.details} transcript.`;
      }
      return `${tag.id} - ${tag.details}`;
    },
  },
};
</script>
