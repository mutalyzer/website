<template>
  <div>
    <!-- {{ this.referenceId }}
    {{ this.selectorId }}
    {{ this.selectorModel }}
    <div>
      {{ this.items }}
    </div> -->
    <v-card outlined color="transparent">
      <v-row class="pa-4" justify="space-between">
        <v-col cols="5">
          <v-treeview
            :open.sync="open"
            :items="items"
            :active.sync="active"
            activatable
            item-key="name"
            open-on-click
          >
          </v-treeview>
        </v-col>

        <v-divider vertical></v-divider>

        <v-col class="d-flex text-center">
          <v-scroll-y-transition mode="out-in">
            <div
              v-if="!selected"
              class="title grey--text text--lighten-1 font-weight-light"
              style="align-self: center"
            >
              Select a User
            </div>
            <v-card
              v-else
              :key="selected.id"
              class="pt-6 mx-auto"
              flat
              max-width="400"
            >
              <v-card-text>
                <v-avatar v-if="avatar" size="88">
                  <v-img
                    :src="`https://avataaars.io/${avatar}`"
                    class="mb-6"
                  ></v-img>
                </v-avatar>
                <h3 class="headline mb-2">
                  {{ selected.name }}
                </h3>
                <div class="blue--text mb-2">
                  {{ selected.email }}
                </div>
                <div class="blue--text subheading font-weight-bold">
                  {{ selected.username }}
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-row class="text-left" tag="v-card-text">
                <v-col class="text-right mr-4 mb-2" tag="strong" cols="5">
                  Company:
                </v-col>
                <v-col>{{ selected.company.name }}</v-col>
                <v-col class="text-right mr-4 mb-2" tag="strong" cols="5">
                  Website:
                </v-col>
                <v-col>
                  <a :href="`//${selected.website}`" target="_blank">{{
                    selected.website
                  }}</a>
                </v-col>
                <v-col class="text-right mr-4 mb-2" tag="strong" cols="5">
                  Phone:
                </v-col>
                <v-col>{{ selected.phone }}</v-col>
              </v-row>
            </v-card>
          </v-scroll-y-transition>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  name: "RenderSelectorDetails",
  props: {
    referenceId: null,
    selectorId: null,
  },
  data() {
    return {
      active: [],
      selectorModel: null,
      items: [],
      open: [this.selectorId],
    };
  },
  computed: {
    selected() {
      if (!this.active.length) return undefined;

      const id = this.active[0];
      console.log(id);

      // return this.selectorModel.find(user => user.id === id);
      return 0;
    },
  },
  created: function () {
    const params = {
      reference_id: this.referenceId,
      feature_id: this.selectorId,
    };
    MutalyzerService.referenceModel(params).then((response) => {
      if (response.data) {
        this.selectorModel = response.data;
        this.items = [this.getItems(this.selectorModel)];
      }
    });
  },
  methods: {
    getItems(annotations) {
      let items = { name: annotations.id };
      if (annotations.features) {
        items.children = [];
        for (const feature of annotations.features) {
          items.children.push(this.getItems(feature));
        }
      }
      return items;
    },
  },
};
</script>
