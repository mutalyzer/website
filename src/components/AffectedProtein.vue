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
    <div v-if="this.fancy_protein_reference">
      <div class="overline">AFFECTED PROTEIN REFERENCE SEQUENCE</div>
      <v-row>
        <v-col class="grow" style="overflow-x: auto">
          <div class="protein-seq">
            <pre v-html="this.fancy_protein_reference"></pre>
          </div>
        </v-col>
        <v-col class="shrink" align-self="start">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                v-clipboard="protein.reference"
              >
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>Copy the reference protein sequence</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <div v-if="this.fancy_protein_predicted">
      <div class="overline">AFFECTED PROTEIN PREDICTED SEQUENCE</div>
      <v-row>
        <v-col class="grow" style="overflow-x: auto">
          <div class="protein-seq">
            <pre v-html="this.fancy_protein_predicted"></pre>
          </div>
        </v-col>
        <v-col class="shrink" align-self="start">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                v-clipboard="protein.predicted"
              >
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>Copy the predicted protein sequence</span>
          </v-tooltip>
        </v-col>
      </v-row>
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
      fancy_protein_reference: null,
      fancy_protein_predicted: null,
      block_length: 10,
      columns: 6,
    };
  },
  created: function () {
    this.fancy_protein_reference = this.fancyFormat(
      this.protein.reference,
      this.block_length,
      this.columns,
      this.protein.position_first,
      this.protein.position_last_original
    );
    this.fancy_protein_predicted = this.fancyFormat(
      this.protein.predicted,
      this.block_length,
      this.columns,
      this.protein.position_first,
      this.protein.position_last_predicted
    );
  },
  methods: {
    fancyFormat(
      sequence,
      block_length,
      columns,
      position_change_first = null,
      position_change_last = null
    ) {
      let blocks = this.blockSplit(sequence, block_length);

      let after_i = Math.floor(position_change_last / block_length);
      let after_i_i =
        position_change_last -
        Math.floor(position_change_last / block_length) * block_length;
      if (after_i == blocks.length) {
        after_i--;
        after_i_i = blocks[blocks.length - 1].length;
      }
      blocks[after_i] = this.insertInto(blocks[after_i], after_i_i, "</b>");

      let before_i = Math.floor(position_change_first / block_length);
      let before_i_i =
        position_change_first -
        Math.floor(position_change_first / block_length) * block_length;
      blocks[before_i] = this.insertInto(
        blocks[before_i],
        before_i_i,
        '<b style="color:#990000">'
      );
      let rows = this.addPositions(
        sequence,
        blocks,
        block_length,
        columns,
        position_change_first,
        position_change_last
      );
      return rows.join("<br>");
    },
    insertInto(s, i, c) {
      return s.slice(0, i) + c + s.slice(i);
    },
    addPositions(
      sequence,
      blocks,
      block_length,
      columns,
      position_change_first = null,
      position_change_last = null
    ) {
      let last_column_position =
        Math.floor(sequence.length / (block_length * columns)) *
          (block_length * columns) +
        1;
      let last_column_position_length = last_column_position.toString().length;

      let rows = [];
      for (
        let row_i = 0;
        row_i < Math.ceil(sequence.length / (block_length * columns));
        row_i++
      ) {
        let current_row_fancy = [
          (block_length * columns * row_i + 1)
            .toString()
            .padStart(last_column_position_length, " "),
        ];

        let row_position_start = row_i * columns * block_length;
        let row_position_end =
          row_i * columns * block_length + columns * block_length;

        if (position_change_first != null && position_change_last != null) {
          if (
            row_position_start > position_change_first &&
            row_position_start < position_change_last
          ) {
            blocks[row_i * columns] = this.insertInto(
              blocks[row_i * columns],
              0,
              '<b style="color:#990000">'
            );
          }
          if (
            (row_position_start < position_change_first &&
              row_position_end < position_change_last) ||
            (row_position_start > position_change_first &&
              row_position_end < position_change_last)
          ) {
            blocks[row_i * columns + columns - 1] = this.insertInto(
              blocks[row_i * columns + columns - 1],
              blocks[row_i * columns + columns - 1].length,
              "</b>"
            );
          }
        }

        for (let column_i = 0; column_i < columns; column_i++) {
          current_row_fancy.push(blocks[row_i * columns + column_i]);
        }
        rows.push(current_row_fancy.join(" "));
      }
      return rows;
    },
    blockSplit(s, block_length) {
      let chunks = [];
      for (let i = 0; i < s.length; i += block_length) {
        chunks.push(s.substr(i, block_length));
      }
      return chunks;
    },
  },
};
</script>
<style scoped src="../assets/main.css"></style>
<style lang="scss" scoped>
.protein-seq {
  margin-left: 5px;
  padding: 10px;
  text-decoration: none;
  font-size: 0.9em;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  display: block;
  color: #004d40;
  background-color: #fafafa;
  overflow-x: auto;
}
</style>
