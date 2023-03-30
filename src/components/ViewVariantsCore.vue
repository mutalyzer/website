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
    <div class="wrapper" id="parent-div">
      <v-icon v-if="!view.inverted" class="mr-2" id="sense-arrow"
        >mdi-arrow-right-bold</v-icon
      >
      <v-icon v-if="view.inverted" class="mr-2" id="sense-arrow"
        >mdi-arrow-left-bold</v-icon
      >
      <div v-for="(v, v_i) in view.views" :key="'v' + v_i" class="seq">
        <!-- outside sequence -->
        <div v-if="v.type == 'outside' && v.sequence">
          <span
            v-for="(s, s_i) in v.sequence"
            :key="'s' + s_i"
            :id="'seq-' + get_position(v, s_i, 'sequence')"
            :ref="'seq-' + get_position(v, s_i, 'sequence')"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip top>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'sequence')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "sequence") }} </span>
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
            :ref="'seq-' + get_position(v, s_i, 'sequence')"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip top>
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
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <span
                  :id="'seq-' + get_position_other(v, null, 'other')"
                  :ref="'seq-' + get_position_other(v, null, 'other')"
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
          <span
            :id="'seq-' + get_position(v, s_i, 'right')"
            v-for="(s, s_i) in v.right"
            :key="'r' + s_i"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip top>
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
          :ref="d_id + '_variant_' + v_i"
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
                :ref="'seq-' + get_position(v, s_i, 'sequence')"
              >
                <v-tooltip top>
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
                :ref="'seq-' + get_position(v, s_i, 'left')"
              >
                <v-tooltip top>
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
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <span
                    :id="'seq-' + get_position_other(v, null, 'other-deleted')"
                    :ref="'seq-' + get_position_other(v, null, 'other-deleted')"
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
                :ref="'seq-' + get_position(v, s_i, 'right-deleted')"
              >
                <v-tooltip top>
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
              <v-tooltip top>
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
                :id="'seq-' + get_position(v, s_i, 'sequence')"
                v-for="(s, s_i) in v.deleted.sequence"
                :key="'ds' + s_i"
              >
                <v-tooltip top>
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
                :id="'seq-' + get_position(v, s_i, 'left')"
                v-for="(s, s_i) in v.deleted.left"
                :key="s_i"
              >
                <v-tooltip top>
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
              <v-tooltip top>
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
            <!-- equal right-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.right">
              <span
                class="seq-elem"
                :id="'seq-' + get_position(v, s_i, 'right-deleted')"
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
      <div id="features-div" class="mt-2 mb-2"></div>
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
    };
  },
  created: function () {
    this.hover_init();
  },
  mounted: function () {
    this.$nextTick(function () {
      var elmnt = document.getElementById("sense-arrow");
      elmnt.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
      const features = this.get_features();
      console.log(features);
      this.add_features(features);
    });
  },
  methods: {
    add_features: function (features) {
      let div = document.getElementById("features-div");
      for (const f of Object.values(features)) {
        const node = document.createElement("div");
        if (f.type == "exon") {
          const textnode = document.createTextNode(
            "exon " + (f.number + 1) + " (" + f.start + ", " + f.end + ")"
          );
          node.appendChild(textnode);
        }
        node.style = f.style;
        div.appendChild(node);
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
          (start <= location && location <= start_left - 1) ||
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
    is_dotted: function (seq) {
      return (seq.match(/-/g) || []).length > 1;
    },
    get_seq_width: function (seq) {
      var seq_el = document.getElementById(seq);
      const seq_rect = seq_el.getBoundingClientRect();
      return seq_rect.right - seq_rect.left;
    },
    get_dotted_extra: function (seq) {
      return this.get_seq_width(seq) / 3;
    },
    get_margin: function (seq) {
      var par_el = document.getElementById("parent-div");
      const par_rect = par_el.getBoundingClientRect();
      var start_el = document.getElementById(seq);
      const start_rect = start_el.getBoundingClientRect();
      let margin = -5;
      if (this.is_dotted(seq)) {
        margin += start_rect.right - par_rect.left - this.get_dotted_extra(seq);
      } else {
        margin += start_rect.left - par_rect.left;
      }
      return margin;
    },
    get_features: function () {
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
      const features = [];
      let multiple_exons = null;
      for (const [i, exon] of Object.entries(exons)) {
        console.log("----------");
        console.log(exon.start_seq, exon.end_seq);

        if (exon.start_seq == exon.end_seq && this.is_dotted(exon.start_seq)) {
          console.log("yes");
          if (!multiple_exons) {
            multiple_exons = {
              type: "multiple_exons",
              start_seq: exon.start_seq,
              end_seq: exon.end_seq,
              start: exon.start,
              end: exon.end,
              number: 1,
            };
            if (i == 0) {
              multiple_exons.start = true;
            } else {
              multiple_exons.start = false;
            }
            continue;
          } else {
            multiple_exons.number += 1;
            continue;
          }
        } else if (
          this.is_dotted(exon.start_seq) &&
          multiple_exons &&
          multiple_exons.start_seq == exon.start_seq
        ) {
          multiple_exons.style = this.get_style(
            "multiple_exons",
            multiple_exons.start_seq,
            multiple_exons.end_seq
          );
          if (multiple_exons.start) {
            multiple_exons.style +=
              "margin-left: " +
              (this.get_margin(multiple_exons.start_seq) -
                this.get_dotted_extra(multiple_exons.start_seq)) +
              "px;";
          }
          features.push(multiple_exons);
          multiple_exons = null;
        }
        let features_exon = {
          type: "exon",
          start_seq: exon.start_seq,
          end_seq: exon.end_seq,
          start: exon.start,
          end: exon.end,
          number: Number(i),
          style: this.get_style("exon", exon.start_seq, exon.end_seq),
        };

        if (i == 0) {
          features_exon.style +=
            "margin-left: " + this.get_margin(exon.start_seq) + "px;";
        }

        if (i > 0) {
          let features_intron = {
            type: "intron",
            start_seq: exons[i - 1].end_seq,
            end_seq: exons[i].start_seq,
            style: this.get_style(
              "intron",
              exons[i - 1].end_seq,
              exons[i].start_seq
            ),
          };
          features.push(features_intron);
        }
        features.push(features_exon);
      }
      // for (let f of features) {
      //   console.log(f);
      // }
      return features;
    },
    scroll_to_variant: function (v_i) {
      var elmnt = document.getElementById(this.d_id + "_variant_" + v_i);
      elmnt.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    get_style: function (feature_type, start_seq, end_seq) {
      if (feature_type == "exon") {
        return (
          "position: relative; display: inline-block; width: " +
          this.get_width_exon(start_seq, end_seq) +
          "px; background-color: green; padding: 5px; text-align: center; border: 1px solid black;"
        );
      } else if (feature_type == "intron") {
        return (
          "position: relative; display: inline-block; height: 5px; width: " +
          this.get_width_intron(start_seq, end_seq) +
          "px; background-color: gray; text-align: center;"
        );
      } else if (feature_type == "multiple_exons") {
        console.log("fsdgfssgfr");
        return (
          "position: relative; display: inline-block; height: 5px; width: " +
          this.get_seq_width(start_seq) / 3 +
          "px; background-color: green; padding: 5px; text-align: center; border: 1px solid black;"
        );
      }
    },
    get_width_exon: function (start_seq, end_seq) {
      console.log("get_width exon");
      var start_el = document.getElementById(start_seq);
      var end_el = document.getElementById(end_seq);
      if (start_el) {
        const start_rect = start_el.getBoundingClientRect();
        const end_rect = end_el.getBoundingClientRect();
        if (this.is_dotted(start_seq) && this.is_dotted(end_seq)) {
          return (
            end_rect.left -
            start_rect.right +
            this.get_dotted_extra(start_seq) +
            this.get_dotted_extra(end_seq)
          );
        } else if (this.is_dotted(start_seq)) {
          return (
            end_rect.right - start_rect.right + this.get_dotted_extra(start_seq)
          );
        } else {
          return end_rect.right - start_rect.left;
        }
      } else {
        return "None";
      }
    },
    get_width_intron: function (start_seq, end_seq) {
      console.log("get_width intron");
      var start_el = document.getElementById(start_seq);
      var end_el = document.getElementById(end_seq);
      if (start_el) {
        const start_rect = start_el.getBoundingClientRect();
        const end_rect = end_el.getBoundingClientRect();
        if (this.is_dotted(start_seq) && this.is_dotted(end_seq)) {
          return (
            end_rect.left - start_rect.right + this.get_dotted_extra(start_seq)
          );
        } else if (this.is_dotted(start_seq)) {
          return (
            end_rect.right -
            start_rect.right +
            this.get_dotted_extra(start_seq) +
            this.get_dotted_extra(end_seq)
          );
        } else if (this.is_dotted(end_seq)) {
          return (
            end_rect.left - start_rect.right + this.get_dotted_extra(end_seq)
          );
        } else {
          return end_rect.left - start_rect.right;
        }
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
