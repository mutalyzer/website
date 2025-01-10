<template>
  <div>
    <div class="variant">
      <span v-for="(v, v_i) in view.views" :key="v_i">
        <span
          v-if="v.type == 'variant'"
          :class="
            hover_variants[v_i] || hover_sequence[v_i]
              ? 'variant-s-hover'
              : 'variant-s'
          "
          @mouseover="
            hover_variants[v_i] = true;
            hover_sequence[v_i] = true;
          "
          @mouseleave="
            hover_variants[v_i] = false;
            hover_sequence[v_i] = false;
          "
          @click="scroll_to_variant(v_i)"
          >{{ v.description }}</span
        >
        <span v-if="v.type == 'variant' && v_i < view.views.length - 2">;</span>
      </span>
    </div>
    <div id="parent-div" class="wrapper">
      <v-icon v-if="!view.inverted" :id="d_id + '_sense-arrow'" class="mr-2"
        >mdi-arrow-right-bold</v-icon
      >
      <v-icon v-if="view.inverted" :id="d_id + '_sense-arrow'" class="mr-2"
        >mdi-arrow-left-bold</v-icon
      >
      <div v-for="(v, v_i) in view.views" :key="'v' + v_i" class="seq">
        <!-- outside sequence -->
        <div v-if="v.type == 'outside' && v.sequence">
          <span
            v-for="(s, s_i) in v.sequence"
            :id="get_html_id(get_position(v, s_i, 'sequence'))"
            :key="'s' + s_i"
            :ref="get_html_id(get_position(v, s_i, 'sequence'))"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-tooltip top>
                <template #activator="{ on: onTooltip }">
                  <span
                    :class="get_seq_class(v, s_i, 'sequence')"
                    v-on="{ ...onTooltip }"
                    >{{ s }}</span
                  ></template
                ><span
                  >{{ get_position_tooltip(get_position(v, s_i, "sequence")) }}
                </span>
              </v-tooltip>
            </v-list-item-action>
          </span>
        </div>
        <!-- outside non sequence-->
        <div v-if="v.type == 'outside' && v.left">
          <!-- left -->
          <span
            v-for="(s, s_i) in v.left"
            :id="get_html_id(get_position(v, s_i, 'sequence'))"
            :key="'l' + s_i"
            :ref="get_html_id(get_position(v, s_i, 'sequence'))"
          >
            <v-tooltip top>
              <template #activator="{ on: onTooltip }">
                <span
                  :class="get_seq_class(v, s_i, 'left')"
                  v-on="{ ...onTooltip }"
                  >{{ s }}</span
                ></template
              ><span>{{
                get_position_tooltip(get_position(v, s_i, "left"))
              }}</span>
            </v-tooltip>
          </span>
          <!-- middle dots -->
          <div
            :id="get_html_id(get_position_other(v, null, 'other'))"
            class="seq"
          >
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <span
                  :ref="get_html_id(get_position_other(v, null, 'other'))"
                  class="seq-elem"
                  v-bind="attrs"
                  v-on="on"
                  >...</span
                ></template
              >
              <span
                >other
                {{ get_position_other_tooltip(v, null, "other") }} bases</span
              >
            </v-tooltip>
          </div>
          <!-- right -->
          <span
            v-for="(s, s_i) in v.right"
            :id="get_html_id(get_position(v, s_i, 'right'))"
            :key="'r' + s_i"
          >
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-tooltip top>
                <template #activator="{ on: onTooltip }">
                  <span
                    :class="get_seq_class(v, s_i, 'right')"
                    v-on="{ ...onTooltip }"
                    >{{ s }}</span
                  ></template
                ><span>{{
                  get_position_tooltip(get_position(v, s_i, "right"))
                }}</span>
              </v-tooltip>
            </v-list-item-action>
          </span>
        </div>
        <!-- variant: deleted & inserted -->
        <div
          v-if="v.type == 'variant'"
          :id="d_id + '_variant_' + v_i"
          :ref="d_id + '_variant_' + v_i"
          class="seq"
          :class="get_variant_seq_class(v_i)"
          @mouseover="
            hover_variants[v_i] = true;
            hover_sequence[v_i] = true;
          "
          @mouseleave="
            hover_variants[v_i] = false;
            hover_sequence[v_i] = false;
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
            <div v-if="v.deleted && v.deleted.sequence" class="seqdel">
              <span
                v-for="(s, s_i) in v.deleted.sequence"
                :id="get_html_id(get_position(v, s_i, 'sequence'))"
                :key="'ds' + s_i"
                :ref="get_html_id(get_position(v, s_i, 'sequence'))"
                class="seq-elem"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_position_tooltip(get_position(v, s_i, "sequence"))
                  }}</span>
                </v-tooltip>
              </span>
            </div>

            <!-- deleted left-->
            <div v-if="v.deleted && v.deleted.left" class="seqdel">
              <span
                v-for="(s, s_i) in v.deleted.left"
                :id="get_html_id(get_position(v, s_i, 'left'))"
                :key="s_i"
                :ref="get_html_id(get_position(v, s_i, 'left'))"
                class="seq-elem"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_position_tooltip(get_position(v, s_i, "left"))
                  }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted middle dots-->
            <div
              v-if="v.deleted && v.deleted.right"
              :id="get_html_id(get_position_other(v, null, 'other-deleted'))"
              class="seqdel"
            >
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <span
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
                  {{ get_position_other_tooltip(v, null, "other-deleted") }}
                  bases</span
                >
              </v-tooltip>
            </div>
            <!-- deleted right-->
            <div v-if="v.deleted && v.deleted.right" class="seqdel">
              <span
                v-for="(s, s_i) in v.deleted.right"
                :id="get_html_id(get_position(v, s_i, 'right-deleted'))"
                :key="s_i"
                :ref="get_html_id(get_position(v, s_i, 'right-deleted'))"
                class="seq-elem"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_position_tooltip(get_position(v, s_i, "right-deleted"))
                  }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted empty-->
            <div v-if="!v.deleted">
              <span class="seq">-</span>
            </div>
            <v-divider></v-divider>
            <!-- inserted sequence -->
            <div v-if="v.inserted && v.inserted.sequence" class="seqins">
              <span
                v-for="(s, s_i) in v.inserted.sequence"
                :key="s_i"
                class="seq-elem"
                >{{ s }}</span
              >
            </div>
            <!-- inserted left-->
            <div v-if="v.inserted && v.inserted.left" class="seqins">
              <span
                v-for="(s, s_i) in v.inserted.left"
                :key="s_i"
                class="seq-elem"
                >{{ s }}</span
              >
            </div>
            <!-- inserted middle dots-->
            <div v-if="v.inserted && v.inserted.right" class="seqins">
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position_other_tooltip(v, null, "other-inserted") }}
                  bases</span
                >
              </v-tooltip>
            </div>
            <!-- inserted right-->
            <div v-if="v.inserted && v.inserted.right" class="seqins">
              <span
                v-for="(s, s_i) in v.inserted.right"
                :key="s_i"
                class="seq-elem"
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
            <div v-if="v.deleted && v.deleted.sequence" class="seqdelequal">
              <span
                v-for="(s, s_i) in v.deleted.sequence"
                :id="get_html_id(get_position(v, s_i, 'sequence'))"
                :key="'ds' + s_i"
                class="seq-elem"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_position_tooltip(get_position(v, s_i, "sequence"))
                  }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- equal left-->
            <div v-if="v.deleted && v.deleted.left" class="seqdelequal">
              <span
                v-for="(s, s_i) in v.deleted.left"
                :id="get_html_id(get_position(v, s_i, 'left'))"
                :key="s_i"
                class="seq-elem"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_position_tooltip(get_position(v, s_i, "left"))
                  }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- equal middle dots-->
            <div
              v-if="v.deleted && v.deleted.right"
              :id="get_html_id(get_position_other(v, null, 'other-deleted'))"
              class="seqdelequal"
            >
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position_other_tooltip(v, null, "other-deleted") }}
                  bases</span
                >
              </v-tooltip>
            </div>
            <!-- equal right-->
            <div v-if="v.deleted && v.deleted.right" class="seqdelequal">
              <span
                v-for="(s, s_i) in v.deleted.right"
                :id="get_html_id(get_position(v, s_i, 'right-deleted'))"
                :key="s_i"
                class="seq-elem"
              >
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_position_tooltip(get_position(v, s_i, "right-deleted"))
                  }}</span>
                </v-tooltip>
              </span>
            </div>
          </div>
        </div>
      </div>
      <v-icon v-if="!view.inverted" class="ml-2">mdi-arrow-right-bold</v-icon>
      <v-icon v-if="view.inverted" class="ml-2">mdi-arrow-left-bold</v-icon>
      <div v-if="features_boundaries" class="mt-3 mb-3">
        <div
          v-for="(f, f_i) in features_boundaries"
          :key="f_i"
          style="display: inline"
        >
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <div v-bind="attrs" :style="f.style" v-on="on"></div
            ></template>
            <span> {{ get_feature_tooltip(f) }}</span>
          </v-tooltip>
        </div>
      </div>
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
    c_s_var: null,
    c_s_seq: null,
  },
  data: function () {
    return {
      hover_variants: null,
      hover_sequence: null,
      seqs: {},
      seqs_other: {},
      last_seq_id: null,
      draw_exons: false,
      features_boundaries: null,
      exons: null,
      cds: null,
      inverted: false,
    };
  },
  created: function () {
    this.hover_init();
  },
  mounted: function () {
    if (this.selector && this.selector.exon && this.selector.exon.g) {
      if (
        parseInt(this.selector.exon.g[0][0], 10) >
        parseInt(this.selector.exon.g[0][1], 10)
      ) {
        this.inverted = true;
      }
      if (this.inverted == true) {
        this.exons = this.selector.exon.g
          .map(function (x) {
            return [parseInt(x[1], 10) - 1, parseInt(x[0], 10)];
          })
          .reverse();
        if (this.selector.cds && this.selector.cds.g) {
          this.cds = this.selector.cds.g.map(function (x) {
            return [parseInt(x[1], 10) - 1, parseInt(x[0], 10)];
          })[0];
        }
      } else {
        this.exons = this.selector.exon.g.map(function (x) {
          return [parseInt(x[0], 10) - 1, parseInt(x[1], 10)];
        });
        if (this.selector.cds && this.selector.cds.g) {
          this.cds = this.selector.cds.g.map(function (x) {
            return [parseInt(x[0], 10) - 1, parseInt(x[1], 10)];
          })[0];
        }
      }
    }
    this.nextTickSteroids(() => {
      var elmnt = document.getElementById(this.d_id + "_sense-arrow");
      elmnt.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
      const features = this.get_features();
      this.features_boundaries = features;
      this.nextTickSteroids(() => {
        var elmnt = document.getElementById(this.d_id + "_variant_1");
        if (elmnt) {
          elmnt.scrollIntoView({
            block: "nearest",
            inline: "center",
          });
        }
      });
    });
  },
  methods: {
    nextTickSteroids: function (callback) {
      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
    },

    get_html_id: function (position) {
      return "seq_" + this.d_id + "-" + position;
    },
    get_feature_tooltip: function (f) {
      if (f.type == "exon") {
        return "exon " + (f.number + 1) + " (" + f.start + ", " + f.end + ")";
      } else if (f.type == "multiple_exons") {
        if (f.number > 1) {
          return f.number + " exons";
        } else {
          return "1 exon";
        }
      } else {
        return f.type;
      }
    },
    get_position_other: function (view, s_i, key) {
      let position = null;
      let left = null;
      let right = null;
      let start = view.start;
      let end = view.end;

      if (key == "other") {
        if (this.view.inverted) {
          left = this.view.seq_length - start - view.left.length;
          right = this.view.seq_length - end + view.right.length + 1;
        } else {
          left = start + 1 + view.left.length;
          right = end - view.right.length;
        }
        position = left + "-" + right;
      } else if (key == "other-deleted") {
        if (this.view.inverted) {
          left = this.view.seq_length - start - view.deleted.left.length;
          right = this.view.seq_length - end + view.deleted.right.length + 1;
        } else {
          left = start + 1 + view.deleted.left.length;
          right = end - view.deleted.right.length;
        }
        position = left + "-" + right;
      } else if (key == "other-inserted") {
        position =
          view.inserted.length -
          (view.inserted.left.length + view.inserted.right.length);
      }
      this.seqs_other[position] = "seq-" + position;
      return position;
    },
    get_position_other_tooltip: function (view, s_i, key) {
      let position = null;
      let start = view.start;
      let end = view.end;

      if (key == "other") {
        position = end - start - (view.left.length + view.right.length);
      } else if (key == "other-deleted") {
        position =
          end - start - (view.deleted.left.length + view.deleted.right.length);
      } else if (key == "other-inserted") {
        position =
          view.inserted.length -
          (view.inserted.left.length + view.inserted.right.length);
      } else {
        position = s_i;
      }
      return position;
    },
    _get_position: function (view, s_i, key) {
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
      return position;
    },
    get_position_tooltip: function (position) {
      var output = "";
      if (this.exons && this.cds) {
        var coding = this.coordinateToCoding(
          position - 1,
          this.exons,
          this.cds,
          this.inverted,
          true,
        );
        var pos = coding[0];
        var offset = coding[1];
        var section = coding[2];

        if (section == -1) {
          pos = Math.abs(pos);
          output += "-" + pos;
        } else if (section == 1) {
          output += "*" + pos;
        } else {
          if (offset < 0) {
            output += pos + "-" + Math.abs(offset);
          } else if (offset > 0) {
            output += pos + "+" + Math.abs(offset);
          } else {
            output += pos;
          }
        }
        if (this.c_s_var && this.c_s_seq) {
          output = this.c_s_var + output + " | " + this.c_s_seq + position;
        } else if (this.c_s_var) {
          output = this.c_s_var + output + " | " + position;
        }
        //  else if (this.exons) {
        // var noncoding = this.multiLocusToPosition(
        //   position - 1,
        //   this.exons,
        //   this.inverted
        // );
        // if (this.c_s_var && this.c_s_seq) {
        //   output = this.c_s_var + output + " | " + this.c_s_seq + position;
        // } else if (this.c_s_var) {
        //   output = this.c_s_var + output + " | " + position;
        // }
        // }
      } else {
        if (this.c_s_var && this.c_s_var == "g.") {
          output = this.c_s_var + position;
        } else {
          output = position;
        }
      }
      return output;
    },
    get_position: function (view, s_i, key) {
      let position = this._get_position(view, s_i, key);
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
    get_seq_id_inverted: function (view, location) {
      if (view.left) {
        let start = this.view.seq_length - view.start;
        let start_left = this.view.seq_length - view.start - view.left.length;
        let end_right = this.view.seq_length - view.end + view.right.length + 1;
        let end = this.view.seq_length - view.end + 1;
        if (
          (start >= location && location >= start_left) ||
          (end_right >= location && location >= end)
        ) {
          return "seq_" + this.d_id + "-" + location;
        } else {
          return "seq_" + this.d_id + "-" + start_left + "-" + end_right;
        }
      } else if (view.deleted && view.deleted.left) {
        const start = view.start + 1;
        const start_left = view.start + 1 + view.deleted.left.length;
        let end_right = view.end - view.deleted.right.length;
        let end = view.end;
        if (
          (start >= location && location >= start_left - 1) ||
          (end_right >= location && location >= end)
        ) {
          return "seq_" + this.d_id + "-" + location;
        } else {
          return "seq_" + this.d_id + "-" + start_left + "-" + end_right;
        }
      } else {
        return "seq_" + this.d_id + "-" + location;
      }
    },
    get_seq_id: function (view, location) {
      if (this.view.inverted) {
        return this.get_seq_id_inverted(view, location);
      }
      if (view.left) {
        let start = view.start + 1;
        let start_left = view.start + 1 + view.left.length;
        let end_right = view.end - view.right.length;
        let end = view.end;
        if (
          (start <= location && location <= start_left) ||
          (end_right <= location && location <= end)
        ) {
          return "seq_" + this.d_id + "-" + location;
        } else {
          return "seq_" + this.d_id + "-" + start_left + "-" + end_right;
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
          return "seq_" + this.d_id + "-" + location;
        } else {
          return "seq_" + this.d_id + "-" + start_left + "-" + end_right;
        }
      } else {
        return "seq_" + this.d_id + "-" + location;
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
      const seq_rect = start_el.getBoundingClientRect();
      let margin = -5;
      if (this.is_dotted(seq)) {
        margin += seq_rect.right - par_rect.left - this.get_dotted_extra(seq);
      } else {
        margin += seq_rect.left - par_rect.left;
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
          exons[i] = { start: exon_start, end: exon_end };
          for (const view of this.view.views) {
            if (this.view.inverted) {
              let view_start = this.view.seq_length - view.start;
              let view_end = this.view.seq_length - view.end + 1;
              if (view_start >= exon_start && exon_start >= view_end) {
                exons[i].start_seq = this.get_seq_id(view, exon_start);
              }
              if (view_start >= exon_end && exon_end >= view_end) {
                exons[i].end_seq = this.get_seq_id(view, exon_end);
              }
            } else {
              if (view.start + 1 <= exon_start && exon_start <= view.end) {
                exons[i].start_seq = this.get_seq_id(view, exon_start);
              }
              if (view.start + 1 <= exon_end && exon_end <= view.end) {
                exons[i].end_seq = this.get_seq_id(view, exon_end);
              }
            }
          }
        }
      }
      const features = [];
      for (const [i, exon] of Object.entries(exons)) {
        if (i == 0) {
          let f_exon = this._exon(exon, i);
          let margin = this.get_margin(exon.start_seq);
          if (
            exon.start_seq == exon.end_seq &&
            this.is_dotted(exon.start_seq)
          ) {
            margin -= this.get_dotted_extra(exon.start_seq);
          }
          f_exon.style += "margin-left: " + margin + "px;";
          features.push(f_exon);
        } else {
          let previous_exon = features.slice(-1)[0];

          // ------------------------------
          if (previous_exon.type == "multiple_exons") {
            if (
              previous_exon.end_seq == exon.start_seq &&
              exon.start_seq == exon.end_seq
            ) {
              previous_exon.number += 1;
            } else if (
              previous_exon.end_seq != exon.start_seq &&
              exon.start_seq != exon.end_seq
            ) {
              let f_intron = this._intron(exons[i - 1], exons[i]);
              let width_intron = this.get_width_intron(
                f_intron.start_seq,
                f_intron.end_seq,
              );
              // width_intron -= this.get_dotted_extra(f_intron.start_seq);
              f_intron.style += "width: " + width_intron + "px;";
              features.push(f_intron);
              features.push(this._exon(exon, i));
            } else if (
              previous_exon.end_seq == exon.start_seq &&
              exon.start_seq != exon.end_seq
            ) {
              features.push(this._exon(exon, i));
            }
            // ------------------------------
          } else {
            if (
              previous_exon.end_seq == exon.start_seq &&
              exon.start_seq != exon.end_seq
            ) {
              if (!this.is_dotted(exon.start_seq)) {
                let f_intron = this._intron(exons[i - 1], exons[i]);
                f_intron.style +=
                  "width: " + this.get_dotted_extra(exon.start_seq) + "px;";
                features.push(f_intron);
              }
              features.push(this._exon(exon, i));
            } else if (
              previous_exon.start_seq != previous_exon.end_seq &&
              exon.start_seq == exon.end_seq
            ) {
              let f_intron = this._intron(exons[i - 1], exons[i]);
              f_intron.style +=
                "width: " +
                this.get_width_intron(f_intron.start_seq, f_intron.end_seq) +
                "px;";
              features.push(f_intron);
              features.push(this._exon(exon, i));
            } else if (
              previous_exon.start_seq == previous_exon.end_seq &&
              previous_exon.start_seq == exon.start_seq &&
              exon.start_seq == exon.end_seq
            ) {
              previous_exon.type = "multiple_exons";
              previous_exon.number = 2;
              previous_exon.style += "background-color: #212121;";
            } else {
              if (Number(previous_exon.end) + 1 != exon.start) {
                let f_intron = this._intron(exons[i - 1], exons[i]);
                let width_intron = this.get_width_intron(
                  f_intron.start_seq,
                  f_intron.end_seq,
                );
                if (this.is_dotted(exon.start_seq)) {
                  width_intron += this.get_dotted_extra(exon.start_seq);
                }
                if (
                  this.is_dotted(previous_exon.end_seq) &&
                  previous_exon.start_seq != previous_exon.end_seq
                ) {
                  width_intron += this.get_dotted_extra(exon.start_seq);
                }
                f_intron.style += "width: " + width_intron + "px;";
                features.push(f_intron);
                features.push(this._exon(exon, i));
              } else {
                let f_exon = this._exon(exon, i);
                features.push(f_exon);
              }
            }
          }
          // ------------------------------
        }
      }
      return features;
    },
    _intron: function (exon_before, exon_after) {
      return {
        type: "intron",
        start_seq: exon_before.end_seq,
        end_seq: exon_after.start_seq,
        style: this.get_intron_style(),
      };
    },
    _exon: function (exon, i) {
      return {
        type: "exon",
        start_seq: exon.start_seq,
        end_seq: exon.end_seq,
        start: exon.start,
        end: exon.end,
        number: Number(i),
        style: this.get_exon_style(exon),
      };
    },
    scroll_to_variant: function (v_i) {
      var elmnt = document.getElementById(this.d_id + "_variant_" + v_i);
      elmnt.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    get_exon_style: function (exon) {
      return (
        "position: relative;" +
        "display: inline-block;" +
        "background-color: #009688;" +
        "height: 20px;" +
        "text-align: center;" +
        "border-left: 2px solid black;" +
        "border-right: 2px solid black;" +
        "vertical-align:middle;" +
        "width: " +
        this.get_width_exon(exon.start_seq, exon.end_seq) +
        "px;"
      );
    },
    get_multiple_exon_style: function (exon) {
      return (
        "position: relative;" +
        "display: inline-block;" +
        "height: 20px;" +
        "background-color: #212121;" +
        "text-align: center;" +
        "border: 1px solid black;" +
        "vertical-align:middle;" +
        "width: " +
        this.get_seq_width(exon.start_seq) / 3 +
        "px; "
      );
    },
    get_intron_style: function () {
      return (
        "position: relative;" +
        "display: inline-block;" +
        "height: 10px;" +
        "background-color: #9E9E9E;" +
        "text-align: center;" +
        "vertical-align:middle;"
      );
    },
    get_width_exon: function (start_seq, end_seq) {
      var start_el = document.getElementById(start_seq);
      var end_el = document.getElementById(end_seq);
      if (start_el) {
        const start_rect = start_el.getBoundingClientRect();
        const end_rect = end_el.getBoundingClientRect();
        if (this.is_dotted(start_seq) && this.is_dotted(end_seq)) {
          if (start_seq == end_seq) {
            return this.get_dotted_extra(start_seq);
          } else {
            return (
              end_rect.left -
              start_rect.right +
              this.get_dotted_extra(start_seq) +
              this.get_dotted_extra(end_seq)
            );
          }
        } else if (this.is_dotted(start_seq)) {
          return (
            end_rect.right - start_rect.right + this.get_dotted_extra(start_seq)
          );
        } else if (this.is_dotted(end_seq)) {
          return (
            end_rect.left - start_rect.left + this.get_dotted_extra(end_seq)
          );
        } else {
          return end_rect.right - start_rect.left;
        }
      } else {
        return "None";
      }
    },
    get_width_intron: function (start_seq, end_seq) {
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
            end_rect.left -
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
      let view_position = this.get_position(v, s_i, key);
      if (this.influence) {
        for (const influence of this.influence) {
          let min_pos = influence[0];
          let max_pos = influence[1];
          if (
            (min_pos || min_pos == 0) &&
            max_pos &&
            min_pos + 1 <= view_position &&
            view_position <= max_pos
          ) {
            return "seq-elem-influence";
          }
        }
      }
      return "seq-elem";
    },
    get_variant_seq_class: function (v_i) {
      let influence_on = "";
      if (this.influence) {
        influence_on = "-influence";
      }
      return this.hover_variants[v_i] || this.hover_sequence[v_i]
        ? "seq-variant" + influence_on
        : "seq-variant-hover" + influence_on;
    },
    nearestBoundary: function (lb, rb, c, p) {
      const dl = c - lb + 1;
      const dr = rb - c;

      if (dl < dr) {
        return 0;
      }
      if (dl > dr) {
        return 1;
      }
      return p;
    },
    nearestLocation: function (ls, c, p = 0) {
      let rb = ls.length - 1;
      let lb = 0;
      let i;

      while (lb <= rb) {
        i = Math.floor((lb + rb) / 2);

        if (c < ls[i][0]) {
          // `c` lies before this location.
          rb = i - 1;
        } else if (c >= ls[i][1]) {
          // `c` lies after this location.
          lb = i + 1;
        } else {
          // `c` lies in this location.
          return i;
        }
      }

      if (i && c < ls[i][0]) {
        // `c` lies before this location.
        return i - 1 + this.nearestBoundary(ls[i - 1][1], ls[i][0], c, p);
      }
      if (i < ls.length - 1) {
        // `c` lies after this location.
        return i + this.nearestBoundary(ls[i][1], ls[i + 1][0], c, p);
      }

      return i;
    },
    getOffsets: function (locations, orientation) {
      let s = 0;
      let output = [0];

      let locs =
        orientation === 1 ? locations.slice() : locations.slice().reverse();

      for (let i = 0; i < locs.length - 1; i++) {
        s += Math.abs(locs[i][0] - locs[i][1]);
        output.push(s);
      }
      return output;
    },
    getOutside: function (coordinate, loci) {
      if (coordinate < loci[0].boundary[0]) {
        return coordinate - loci[0].boundary[0];
      }
      if (coordinate > loci[loci.length - 1].boundary[1]) {
        return coordinate - loci[loci.length - 1].boundary[1];
      }
      return 0;
    },
    getDirection: function (index, offsets, inverted = false) {
      if (inverted) {
        return offsets.length - index - 1;
      }
      return index;
    },
    locusToPosition: function (coordinate, location, inverted = false) {
      const boundary = [location[0], location[1] - 1];
      const end = boundary[1] - boundary[0];

      if (inverted) {
        if (coordinate > boundary[1]) {
          return [0, boundary[1] - coordinate];
        }
        if (coordinate < boundary[0]) {
          return [end, boundary[0] - coordinate];
        }
        return [boundary[1] - coordinate, 0];
      }

      if (coordinate < boundary[0]) {
        return [0, coordinate - boundary[0]];
      }
      if (coordinate > boundary[1]) {
        return [end, coordinate - boundary[1]];
      }
      return [coordinate - boundary[0], 0];
    },
    multiLocusToPosition: function (coordinate, locations, inverted = false) {
      const loci = locations.map((location) => ({
        boundary: [location[0], location[1] - 1],
        end: location[1] - 1 - location[0],
      }));
      const orientation = inverted ? -1 : 1;
      const offsets = this.getOffsets(locations, orientation);
      const index = this.nearestLocation(locations, coordinate, inverted);
      const outside = orientation * this.getOutside(coordinate, loci);
      const location = this.locusToPosition(
        coordinate,
        locations[index],
        inverted,
      );

      return [
        location[0] + offsets[this.getDirection(index, offsets, inverted)],
        location[1],
        outside,
      ];
    },
    coordinateToCoding: function (
      coordinate,
      exons,
      cds,
      inverted = false,
      degenerate = false,
    ) {
      const b0 = this.multiLocusToPosition(cds[0], exons, inverted);
      const b1 = this.multiLocusToPosition(cds[1], exons, inverted);

      let coding, cdsLen;
      if (inverted) {
        coding = [b1[0] + b1[1] + 1, b0[0] + b0[1] + 1];
        cdsLen = b0[0] + b0[1] - (b1[0] + b1[1]);
      } else {
        coding = [b0[0] + b0[1], b1[0] + b1[1]];
        cdsLen = b1[0] + b1[1] - (b0[0] + b0[1]);
      }
      let pos = this.multiLocusToPosition(coordinate, exons, inverted);
      if (pos[0] < coding[0]) {
        pos = [pos[0] - coding[0], pos[1], -1, pos[2]];
      } else if (pos[0] >= coding[1]) {
        pos = [pos[0] - coding[1] + 1, pos[1], 1, pos[2]];
      } else {
        pos = [pos[0] - coding[0] + 1, pos[1], 0, pos[2]];
      }

      if (degenerate && pos[3]) {
        if (pos[2] === 0) {
          if (pos[0] === 1 && pos[1] < 0) {
            return [pos[1], 0, -1, pos[3]];
          }
          if (pos[0] === cdsLen && pos[1] > 0) {
            return [pos[0] + pos[1] - cdsLen, 0, 1, pos[3]];
          }
        }
        return [pos[0] + pos[1], 0, pos[2], pos[3]];
      }

      return pos;
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
  background-color: var(--blue-grey-lighten-3);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq-variant-hover {
  background-color: var(--blue-grey-lighten-4);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}
.seq-variant-influence {
  background-color: var(--blue-grey-lighten-3);
  border-style: solid;
  border-width: 4px;
  border-color: var(--blue-grey-lighten-5);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq-variant-hover-influence {
  background-color: var(--blue-grey-lighten-4);
  border-style: solid;
  border-width: 4px;
  border-color: var(--blue-grey-lighten-5);
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
