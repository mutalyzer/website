<template>
  <div>
    <div class="variant">
      <span v-for="(v, v_i) in view.views" :key="v_i">
        <span
          v-if="v.type == 'variant'"
          @mouseover="
            hover_variants[v_i] = true;
            hover_sequence[v_i] = true;
          "
          @mouseleave="
            hover_variants[v_i] = false;
            hover_sequence[v_i] = false;
          "
          :class="
            hover_variants[v_i] || hover_sequence[v_i]
              ? 'variant-s-hover'
              : 'variant-s'
          "
          @click="scroll_to_variant(v_i)"
          >{{ v.description }}</span
        >
        <span v-if="v.type == 'variant' && v_i < view.views.length - 2">;</span>
      </span>
    </div>
    <div class="wrapper">
      <div v-if="exons && draw_exons">
        <span
          v-for="(e, e_i) in exons"
          :key="e_i"
          style="display: inline-block; width: 400px; background-color: var(--blue-grey-lighten-4)"
        >
          {{ e.start }} _ {{ e.end }}; {{ e.start_seq }} _ {{ e.end_seq }};
          {{ get_element_details(e.start_seq) }};
          {{ get_element_details(e.end_seq) }}
        </span>
      </div>

      <v-icon v-if="!view.inverted" class="mr-2">mdi-arrow-right-bold</v-icon>
      <v-icon v-if="view.inverted" class="mr-2">mdi-arrow-left-bold</v-icon>
      <div v-for="(v, v_i) in view.views" :key="'v' + v_i" class="seq">
        <!-- outside sequence -->
        <div v-if="v.type == 'outside' && v.sequence">
          <span
            v-for="(s, s_i) in v.sequence"
            :key="'s' + s_i"
            :id="'seq-' + get_position(v, s_i, 'sequence')"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'sequence')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "sequence") }}</span>
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
        <div v-if="v.type == 'outside' && v.left">
          <!-- left -->
          <span
            v-for="(s, s_i) in v.left"
            :key="'l' + s_i"
            :id="'seq-' + get_position(v, s_i, 'sequence')"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'left')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "left") }}</span>
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
          <!-- middle dots -->
          <div class="seq">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  :id="'seq-' + get_position_other(v, null, 'other')"
                  class="seq-elem"
                  v-bind="attrs"
                  v-on="on"
                  >...</span
                ></template
              >
              <span
                >other {{ get_position_other(v, null, "other") }} bases</span
              >
            </v-tooltip>
          </div>
          <!-- right -->
          <span v-for="(s, s_i) in v.right" :key="'r' + s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'right')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "right") }}</span>
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
        <!-- variant: deleted & inserted -->
        <div
          class="seq"
          :id="d_id + '_variant_' + v_i"
          v-if="v.type == 'variant'"
          @mouseover="
            hover_variants[v_i] = true;
            hover_sequence[v_i] = true;
          "
          @mouseleave="
            hover_variants[v_i] = false;
            hover_sequence[v_i] = false;
          "
          :class="
            hover_variants[v_i] || hover_sequence[v_i]
              ? 'seq-variant'
              : 'seq-variant-hover'
          "
        >
          <div
            v-if="
              (v.deleted || v.inserted) &&
              v.description &&
              !v.description.includes('=')
            "
          >
            <!-- deleted sequence -->
            <div class="seqdel" v-if="v.deleted && v.deleted.sequence">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.sequence"
                :key="'ds' + s_i"
                :id="'seq-' + get_position(v, s_i, 'sequence')"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "sequence") }}</span>
                </v-tooltip>
              </span>
            </div>

            <!-- deleted left-->
            <div class="seqdel" v-if="v.deleted && v.deleted.left">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.left"
                :key="s_i"
                :id="'seq-' + get_position(v, s_i, 'left')"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "left") }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted middle dots-->
            <div class="seqdel" v-if="v.deleted && v.deleted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span
                    :id="'seq-' + get_position_other(v, null, 'other-deleted')"
                    class="seq-elem"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position_other(v, null, "other-deleted") }} bases</span
                >
              </v-tooltip>
            </div>
            <!-- deleted right-->
            <div class="seqdel" v-if="v.deleted && v.deleted.right">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.right"
                :key="s_i"
                :id="'seq-' + get_position(v, s_i, 'right-deleted')"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "right-deleted") }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted empty-->
            <div v-if="!v.deleted">
              <span class="seq">-</span>
            </div>
            <v-divider></v-divider>
            <!-- inserted sequence -->
            <div class="seqins" v-if="v.inserted && v.inserted.sequence">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.inserted.sequence"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted left-->
            <div class="seqins" v-if="v.inserted && v.inserted.left">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.inserted.left"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted middle dots-->
            <div class="seqins" v-if="v.inserted && v.inserted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position_other(v, null, "other-inserted") }}
                  bases</span
                >
              </v-tooltip>
            </div>
            <!-- inserted right-->
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
          <div v-else>
            <!-- equal -->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.sequence">
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
                  <span>{{ get_position(v, s_i, "sequence") }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- equal left-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.left">
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
                  <span>{{ get_position(v, s_i, "left") }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- equal middle dots-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position_other(v, null, "other-deleted") }} bases</span
                >
              </v-tooltip>
            </div>
            <!-- equal right-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.right">
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
                  <span>{{ get_position(v, s_i, "right-deleted") }}</span>
                </v-tooltip>
              </span>
            </div>
          </div>
        </div>
      </div>
      <v-icon v-if="!view.inverted" class="ml-2">mdi-arrow-right-bold</v-icon>
      <v-icon v-if="view.inverted" class="ml-2">mdi-arrow-left-bold</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewVariantsCore",
  props: {
    view: null,
    influence: null,
    d_id: null,
    selector: null,
  },
  data: function () {
    return {
      hover_variants: null,
      hover_sequence: null,
      seqs: {},
      seqs_other: {},
      last_seq_id: null,
      draw_exons: false,
      exons: null,
    };
  },
  created: function () {
    this.hover_init();
    this.last_seq_id = this.get_last_seq_id();
    this.exons = this.get_exons();
    // console.log(this.view.views);
    // console.log(this.selector);
  },
  methods: {
    get_last_seq_id: function () {
      if (this.view && this.view.views) {
        if (this.view.inverted) {
          return this.view.views[0].start;
        } else {
          return this.view.views[this.view.views.length - 1].end;
        }
      }
    },

    get_position_other: function (view, s_i, key) {
      let position = null;
      if (key == "other") {
        position =
          view.start +
          1 +
          view.left.length +
          "-" +
          (view.end - view.right.length);
      } else if (key == "other-deleted") {
        position =
          view.start +
          1 +
          view.deleted.left.length +
          "-" +
          (view.end - view.deleted.right.length);
      } else if (key == "other-inserted") {
        position =
          view.inserted.length -
          (view.inserted.left.length + view.inserted.right.length);
      }
      if (this.view.inverted) {
        position = this.view.seq_length - position - 1;
      }
      this.seqs_other[position] = "seq-" + position;

      return position;
    },
    get_position: function (view, s_i, key) {
      let position = null;
      if (key == "sequence") {
        position = s_i + view.start;
      } else if (key == "left") {
        position = s_i + view.start;
      } else if (key == "right") {
        position = view.end - view.right.length + s_i;
      } else if (key == "right-deleted") {
        position = view.end - view.deleted.right.length + s_i;
      } else {
        position = s_i;
      }
      if (this.view.inverted) {
        return this.view.seq_length - position;
      }

      position += 1;
      this.seqs[position] = "seq-" + position;
      if (position == this.last_seq_id) {
        this.draw_exons = true;
      }
      return position;
    },
    hover_init: function () {
      let h_v = {};
      let h_s = {};
      if (this.view && this.view.views) {
        for (const [i, v] of this.view.views.entries()) {
          if (v.type == "variant") {
            h_v[i] = false;
            h_s[i] = false;
          }
        }
      }
      this.hover_variants = h_v;
      this.hover_sequence = h_s;
    },
    get_exons_seq: function (views, exon) {
      for (const view of views) {
        if (view.start + 1 <= exon.start && view.end <= exon.start) {
          this.get_seq_id(view, exon.start);
        }
        if (view.start + 1 <= exon.end && view.end <= exon.end) {
          this.get_seq_id(view, exon.end);
        }
      }
    },
    get_seq_id: function (view, location) {
      if (view.left) {
        const start = view.start + 1;
        const start_left = view.start + 1 + view.left.length;
        let end_right = view.end - view.right.length;
        let end = view.end;
        if (
          (start <= location && location <= start_left) ||
          (end_right <= location && location <= end)
        ) {
          return "seq-" + location;
        } else {
          return "seq-" + start_left + "-" + end_right;
        }
      } else if (view.deleted && view.deleted.left) {
        const start = view.start + 1;
        const start_left = view.start + 1 + view.deleted.left.length;
        let end_right = view.end - view.deleted.right.length;
        let end = view.end;
        if (
          (start <= location && location <= start_left) ||
          (end_right <= location && location <= end)
        ) {
          return "seq-" + location;
        } else {
          return "seq-" + start_left + "-" + end_right;
        }
      } else {
        return "seq-" + location;
      }
    },
    get_exons: function () {
      let exons = {};
      if (
        this.view &&
        this.view.views &&
        this.selector &&
        this.selector.exon &&
        this.selector.exon.g
      ) {
        for (const [i, exon] of this.selector.exon.g.entries()) {
          const exon_start = Number(exon[0]);
          const exon_end = Number(exon[1]);
          exons[i] = { start: exon[0], end: exon[1] };
          for (const view of this.view.views) {
            if (
              Number(view.start) + 1 <= exon_start &&
              exon_start <= Number(view.end)
            ) {
              exons[i].start_seq = this.get_seq_id(view, exon_start);
            }
            if (
              Number(view.start) + 1 <= exon_end &&
              exon_end <= Number(view.end)
            ) {
              exons[i].end_seq = this.get_seq_id(view, exon_end);
            }
          }
        }
      }
      // console.log(exons);
      return exons;
    },
    scroll_to_variant: function (v_i) {
      var elmnt = document.getElementById(this.d_id + "_variant_" + v_i);
      elmnt.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    get_element_details: function (v_i) {
      var elmnt = document.getElementById(v_i);
      console.log(v_i);
      console.log(elmnt);
      if (elmnt) {
        console.log(elmnt.offsetWidth);
        const rect = elmnt.getBoundingClientRect();
        console.log(rect.top);
        console.log(rect.left);
        console.log(rect.bottom);
        console.log(rect.right);

        return rect.right - rect.left;
      } else {
        return "None";
      }
    },
    get_seq_class: function (v, s_i, key) {
      if (
        this.influence &&
        (this.influence.min_pos || this.influence.min_pos == 0) &&
        this.influence.max_pos &&
        this.influence.min_pos <= this.get_position(v, s_i, key) &&
        this.get_position(v, s_i, key) < this.influence.max_pos
      ) {
        return "seq-elem-influence";
      }
      return "seq-elem";
    },
  },
  watch: {
    isLogged(value) {
      if (value) {
        this.checkDiv();
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
  word-break: break-all;
  background-color: var(--blue-grey-lighten-5);
}

.variant-s {
  font-family: monospace;
  padding: 5px;
  background-color: var(--blue-grey-lighten-5);
}

.variant-s-hover {
  font-family: monospace;
  padding: 5px;
  background-color: var(--blue-grey-lighten-4);
  cursor: pointer;
}

.seq-variant {
  background-color: var(--blue-grey-lighten-4);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq-variant-hover {
  background-color: var(--blue-grey-lighten-5);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}
/* .blk{} */

.seq {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 auto;
  font-family: monospace;
  color: #000000;
}

.seq-elem {
  padding: 5px;
  text-align: center;
}

.seq-elem:hover {
  padding: 5px;
  background-color: #b8b8b8;
  cursor: pointer;
}

.seq-elem-influence {
  padding: 5px;
  background-color: var(--blue-grey-lighten-5);
  text-align: center;
}

.seq-elem-influence:hover {
  padding: 5px;
  background-color: #b8b8b8;
  cursor: pointer;
}

.seqdel {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #b71c1c;
}

.seqdelequal {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #004d40;
}

.seqins {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #1c1fb7;
}
.sel {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 auto;
  font-family: monospace;
  color: #000000;
}
</style>
