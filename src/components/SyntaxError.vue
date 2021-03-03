<template>
  <div>
    <div class="overline">{{ error.details }}</div>
    <div>
      <span v-if="error.correct.view" class="correct">{{
        error.correct.view
      }}</span>
      <span v-if="error.erroneus.view" class="erroneus">
        {{ error.erroneus.view }}
      </span>
      <span v-if="error.unknown.view" class="unknown">{{
        error.unknown.view
      }}</span>
    </div>
    <div>
      <div class="overline mt-2">Expecting:</div>
    </div>
    <div v-for="(expecting, index) in error.erroneus.expecting" :key="index">
      <div class="expecting">{{ expecting }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModelView",
  props: {
    errorModel: {},
  },
  data() {
    return {
      error: {},
    };
  },
  created: function () {
    this.error = this.unpackModel(this.errorModel);
  },
  methods: {
    unpackModel: function (model) {
      var values = { details: "Unexpected character:" };
      var pos_in_stream = model.pos_in_stream;
      if (model.details == "Unexpected end of input.") {
        pos_in_stream -= 1;
      }
      values.correct = {
        view: model.description.slice(0, pos_in_stream),
        hover: false,
      };
      values.erroneus = {
        view: model.description.slice(pos_in_stream, pos_in_stream + 1),
        hover: false,
      };
      if (model.expecting) {
        values.erroneus.expecting = [...new Set(model.expecting)];
      }
      values.unknown = {
        view: model.description.slice(
          pos_in_stream + 1,
          model.description.length
        ),
        hover: false,
      };

      return values;
    },
  },
};
</script>

<style scoped>
.correct {
  font-family: monospace;
  display: inline;
  margin-left: 5px;
}

.unknown {
  font-family: monospace;
  display: inline;
  color: #eceff1;
}

.erroneus {
  font-family: monospace;
  display: inline;
  margin: 3px;
  padding: 4px 0px;
  color: #b71c1c;
  background-color: #ffebee;
}

.expecting {
  margin: 5px 5px 0px;
  padding: 5px;
  color: #b71c1c;
  background-color: #ffebee;
  font-family: monospace;
}
</style>
