<template>
  <div>
    <div>
      <span v-if="unpackedModel.correct.view" class="correct">
        {{ unpackedModel.correct.view }}
      </span>
      <span
        v-if="unpackedModel.erroneus.view"
        @mouseover="unpackedModel.erroneus.hover = true"
        @mouseleave="unpackedModel.erroneus.hover = false"
        class="erroneus"
      >
        {{ unpackedModel.erroneus.view }}
      </span>
      <span v-if="unpackedModel.unknown.view" class="unknown">
        {{ unpackedModel.unknown.view }}
      </span>
    </div>
    <div>
      <div class="overline mt-2">Expecting</div>
    </div>
    <div
      v-for="(expecting, index) in unpackedModel.erroneus.expecting"
      :key="index"
    >
      <div class="error-message">
        {{ expecting }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModelView",
  props: {
    errorModel: {}
  },
  data() {
    return {
      unpackedModel: {}
    };
  },
  created: function() {
    this.unpackedModel = this.unpackModel(this.errorModel);
  },
  methods: {
    unpackModel: function(model) {
      var values = {};
      values.correct = {
        view: model.description.slice(0, model.pos_in_stream),
        hover: false
      };
      values.erroneus = {
        view: model.description.slice(
          model.pos_in_stream,
          model.pos_in_stream + 1
        ),
        hover: false
      };
      if (model.expecting) {
        values.erroneus.expecting = model.expecting;
      }
      values.unknown = {
        view: model.description.slice(
          model.pos_in_stream + 1,
          model.description.length
        ),
        hover: false
      };

      return values;
    }
  }
};
</script>

<style scoped>
.correct {
  font-family: monospace;
  display: inline-block;
}

.unknown {
  font-family: monospace;
  display: inline-block;
  color: #bdbdbd;
}

.erroneus {
  font-family: monospace;
  display: inline-block;
  color: #b71c1c;
}

.error-message {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffebee;
}

.error-message-hover {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffcdd2;
}

.description-info {
  margin: 0;
  padding: 0 1px;
  color: #01579b;
  font-family: monospace;
  display: inline-block;
}

.description-info-hover {
  margin: 0;
  padding: 0 1px;
  color: #01579b;
  font-family: monospace;
  background-color: #81d4fa;
  display: inline-block;
}

.description-error {
  margin: 0;
  padding: 0 1px;
  color: #b71c1c;
  font-family: monospace;
  display: inline-block;
}

.description-error-hover {
  margin: 0;
  padding: 0 1px;
  color: #b71c1c;
  font-family: monospace;
  background-color: #ffcdd2;
  display: inline-block;
}

.description {
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;
}

.description-hover {
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;
  background-color: #81d4fa;
}
</style>
