<template>
  <div>
    <div class="variant">
      <span v-for="(variant, v_i) in view" :key="v_i">
        <span v-if="variant.type == 'variant'">
          {{ variant.description
          }}<span v-if="v_i < view.length - 2">;</span></span
        >
      </span>
    </div>
    <div class="wrapper">
      <div v-for="(v, v_i) in view" :key="'v' + v_i" class="seq">
        <!-- outside sequence -->
        <div v-if="v.type == 'outside' && v.sequence" class="seq">
          <span
            class="seq-elem"
            v-for="(s, s_i) in v.sequence"
            :key="'s' + s_i"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span v-on="{ ...onMenu, ...onTooltip }">{{
                        s
                      }}</span></template
                    ><span> {{ get_position(v, s_i, "sequence") }}</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
        </div>
        <!-- outside non sequence-->
        <div v-if="v.type == 'outside' && v.left" class="seq">
          <!-- left -->
          <span class="seq-elem" v-for="(s, s_i) in v.left" :key="'l' + s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span v-on="{ ...onMenu, ...onTooltip }">{{
                        s
                      }}</span></template
                    ><span> get_left_position(variant, s_i)</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
          <div class="seq">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span class="seq-elem" v-bind="attrs" v-on="on">
                  <span>...</span></span
                ></template
              >
              <span>other get_before_length(variant) bases</span>
            </v-tooltip>
          </div>
          <!-- right -->
          <span class="seq-elem" v-for="(s, s_i) in v.left" :key="'r' + s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span v-on="{ ...onMenu, ...onTooltip }">{{
                        s
                      }}</span></template
                    ><span> get_right_position(variant, s_i)</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
        </div>
        <!-- deleted & inserted -->
        <div class="seq" v-if="v.type == 'variant'">
          <!-- deleted not shrunk -->
          <div class="seqdel" v-if="v.deleted && v.deleted.sequence">
            <span
              class="seq-elem"
              v-for="(s, s_i) in v.deleted.sequence"
              :key="'ds' + s_i"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <span>{{ s }}</span></span
                  ></template
                >
                <span> get_deleted_not_shrunk_position(variant, s_i) </span>
              </v-tooltip>
            </span>
          </div>
          <!-- deleted shrunk left-->
          <div class="seqdel" v-if="v.deleted && v.deleted.left">
            <span
              class="seq-elem"
              v-for="(s, s_i) in v.deleted.left"
              :key="s_i"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <span>{{ s }}</span></span
                  ></template
                >
                <span> get_shrunk_left_position(variant, s_i) </span>
              </v-tooltip>
            </span>
          </div>
          <!-- deleted shrunk middle dots-->
          <div class="seqdel" v-if="v.deleted && v.deleted.right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span class="seq-elem" v-bind="attrs" v-on="on">
                  <span>...</span></span
                ></template
              >
              <span
                >other get_shrunk_not_included_bases(variant, "deleted")
                bases</span
              >
            </v-tooltip>
          </div>
          <!-- deleted shrunk right-->
          <div class="seqdel" v-if="v.deleted && v.deleted.right">
            <span
              class="seq-elem"
              v-for="(s, s_i) in v.deleted.right"
              :key="s_i"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <span>{{ s }}</span></span
                  ></template
                >
                <span>get_shrunk_right_position(variant, s_i, "deleted")</span>
              </v-tooltip>
            </span>
          </div>
          <!-- deleted empty-->
          <div v-if="!v.deleted">
            <span class="seq">-</span>
          </div>
          <v-divider></v-divider>
          <!-- inserted not shrunk -->
          <div class="seqins" v-if="v.inserted && v.inserted.sequence">
            <span class="seq-elem" v-for="(s, s_i) in v.inserted" :key="s_i">{{
              s
            }}</span>
          </div>
          <!-- inserted shrunk left-->
          <div class="seqins" v-if="v.inserted && v.inserted.left">
            <span
              class="seq-elem"
              v-for="(s, s_i) in v.inserted.left"
              :key="s_i"
              >{{ s }}</span
            >
          </div>
          <!-- inserted shrunk middle dots-->
          <div class="seqins" v-if="v.inserted && v.inserted.right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span class="seq-elem" v-bind="attrs" v-on="on">
                  <span>...</span></span
                ></template
              >
              <span
                >other get_shrunk_not_included_bases(variant, "inserted")
                bases</span
              >
            </v-tooltip>
          </div>
          <!-- inserted shrunk right-->
          <div class="seqins" v-if="v.inserted && v.inserted.right">
            <span
              class="seq-elem"
              v-for="(s, s_i) in v.inserted.right"
              :key="s_i"
              >{{ s }}</span
            >
          </div>
          <!-- inserted empty -->
          <div v-if="!v.inserted">
            <span class="seq">-</span>
          </div>
        </div>
      </div>
    </div>
    <v-expansion-panels focusable hover flat class="mt-5 mb-10" v-if="view">
      <v-expansion-panel>
        <v-expansion-panel-header>View as a tree</v-expansion-panel-header>
        <v-expansion-panel-content>
          <JsonPretty :summary="view" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import JsonPretty from "./JsonPretty.vue";

export default {
  name: "ViewVariantsCompare",
  components: {
    JsonPretty,
  },
  props: {
    view: null,
  },
  methods: {
    get_position: function (view, s_i, key) {
      if (key == "sequence") {
        return s_i + view.start;
      }
      console.log(view);
      console.log(s_i);
      console.log(key);
      return s_i;
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
