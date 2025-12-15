<template>
  <v-sheet class="pt-10 pr-10 pb-8 pl-10" color="orange lighten-5">
    <div>
      <p>
        <span v-for="(part, index) in parsedErrorDetails" :key="index"
          ><code v-if="part.type === 'code'">{{ part.text }}</code
          ><template v-else>{{ part.text }}</template></span
        >
      </p>
      <p class="mt-4 font-weight-medium">
        Did you mean one of the following descriptions?
      </p>
      <div>
        <v-sheet outlined class="pa-4 my-4">
          <Description
            v-for="(option, ind) in getSortedOptions(error.options)"
            :key="ind"
            :description="option.description"
            css_class="other-description-link"
            :to_name="'Normalizer'"
            :to_params="{ descriptionRouter: option.description }"
          />
        </v-sheet>
      </div>
    </div>
  </v-sheet>
</template>

<script>
import Description from "./Description.vue";

export default {
  name: "SelectorOptionsError",
  components: {
    Description,
  },
  props: {
    error: {
      type: Object,
      required: true,
    },
  },
  computed: {
    parsedErrorDetails() {
      return this.parseInlineCode(this.error.details);
    },
  },
  methods: {
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
    parseInlineCode(text) {
      if (!text) return [];

      const tokens = [];
      const regex = /`([^`]+)`/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // text before code
        if (match.index > lastIndex) {
          tokens.push({
            type: "text",
            text: text.slice(lastIndex, match.index),
          });
        }

        // code token
        tokens.push({
          type: "code",
          text: match[1],
        });

        lastIndex = regex.lastIndex;
      }

      // remaining text
      if (lastIndex < text.length) {
        tokens.push({
          type: "text",
          text: text.slice(lastIndex),
        });
      }

      return tokens;
    },
  },
};
</script>
