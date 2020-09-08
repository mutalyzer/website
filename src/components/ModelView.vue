<template>
  <div>
    <div>
      <span v-for="(v, index) in unpackedModel" :key="index">
        <span
          v-if="v.view"
          @mouseover="v.hover = true"
          @mouseleave="v.hover = false"
          :class="[getDescriptionClass(v)]"
        >
          {{ v.view }}
        </span>
      </span>
    </div>
    <div v-for="(v, index) in unpackedModel" :key="index">
      <div
        v-if="v.errors"
        @mouseover="v.hover = true"
        @mouseleave="v.hover = false"
        :class="[v.hover && v.errors ? 'error-message-hover' : 'error-message']"
      >
        <div
          v-for="(error, index) in v.errors"
          :key="index"
          @mouseover="v.hover = true"
          @mouseleave="v.hover = false"
          :class="[
            v.hover && v.errors ? 'error-message-hover' : 'error-message'
          ]"
        >
          {{ getMessage(error) }}
        </div>
      </div>
    </div>
    <div>
      <div v-for="(v, index) in unpackedModel" :key="index">
        <div
          v-if="v.info"
          @mouseover="v.hover = true"
          @mouseleave="v.hover = false"
          :class="[v.hover && v.info ? 'info-message-hover' : 'info-message']"
        >
          <div
            v-for="(info, index) in v.info"
            :key="index"
            @mouseover="v.hover = true"
            @mouseleave="v.hover = false"
            :class="[v.hover && v.info ? 'info-message-hover' : 'info-message']"
          >
            {{ getMessage(info) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModelView",
  props: {
    model: {}
  },
  data() {
    return {
      unpackedModel: []
    };
  },
  created: function() {
    this.unpackedModel = this.unpackModel(this.model);
  },
  methods: {
    unpackModel: function(model) {
      var output = [];
      if (model) {
        if (model.reference) {
          output.push(this.getReference(model.reference));
          if (model.reference.selector) {
            output.push(this.getSelector(model.reference.selector));
          }
        }
        output.push({ view: ":" });
        if (model.coordinate_system) {
          output.push(this.getCoordinateSystem(model));
          output.push({ view: "." });
        }
        if (model.location) {
          this.getLocation(model.location).forEach(function(element) {
            output.push(element);
          });
        }
      }
      return output;
    },
    getReference: function(reference) {
      const output = {};
      if (reference.errors) {
        output.errors = reference.errors;
      }
      if (reference.info) {
        output.info = reference.info;
      }
      if (reference.id) {
        output.view = reference.id;
      }
      output.hover = false;
      return output;
    },
    getSelector: function(selector) {
      const output = {};
      if (selector.errors) {
        output.errors = selector.errors;
      }
      if (selector.info) {
        output.info = selector.info;
      }
      if (selector.id) {
        output.view = "(" + selector.id + ")";
      }
      output.hover = false;
      return output;
    },
    getCoordinateSystem: function(model) {
      const output = {};
      if (model.errors) {
        output.errors = model.errors;
      }
      if (model.info) {
        output.info = model.info;
      }
      if (model.coordinate_system) {
        output.view = model.coordinate_system;
      }
      output.hover = false;
      return output;
    },
    getLocation: function(location) {
      const output = [];
      if (location.type === "point") {
        output.push(this.getPoint(location));
      }
      if (location.type == "range") {
        return this.getRange(location);
      }
      if (location.errors) {
        output.errors = location.errors;
      }
      if (location.info) {
        output.info = location.info;
      }
      if (location.id) {
        output.view = location.id;
      }
      return output;
    },
    getRange: function(location) {
      const output = [];
      if (location.uncertain) {
        output.push({ view: "(" });
      }
      if (location.start.type === "point") {
        output.push(this.getPoint(location.start));
      } else if (location.start.type === "range") {
        this.getRange(location.start).forEach(function(element) {
          output.push(element);
        });
      }
      output.push({ view: "_" });
      if (location.end.type === "point") {
        output.push(this.getPoint(location.end));
      } else if (location.end.type === "range") {
        this.getRange(location.end).forEach(function(element) {
          output.push(element);
        });
      }
      if (location.uncertain) {
        output.push({ view: ")" });
      }

      if (location.errors) {
        output.errors = location.errors;
      }
      if (location.info) {
        output.info = location.info;
      }
      if (location.id) {
        output.view = location.id;
      }
      return output;
    },
    getPoint: function(point) {
      const output = {};
      if (point.errors) {
        output.errors = point.errors;
      }
      if (point.info) {
        output.info = point.info;
      }
      if (point.uncertain) {
        output.view = "?";
      } else {
        let view = "";
        if (point.outside_cds && point.outside_cds === "downstream") {
          view += "*";
        }
        if (point.position) {
          view += point.position;
        }
        if (point.offset && point.offset.value) {
          if (point.offset.value > 0) {
            view += "+" + point.offset.value;
          } else {
            view += point.offset.value;
          }
        }
        if (view) {
          output.view = view;
        }
      }
      output.hover = false;
      return output;
    },

    getView: function(modelNode) {
      if (modelNode.view) {
        return modelNode.view;
      } else {
        return "";
      }
    },
    getMessage: function(message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
    },
    getDescriptionClass: function(v) {
      if (v.errors) {
        return v.hover && v.errors
          ? "description-error-hover"
          : "description-error";
      }
      if (v.info) {
        return v.hover && v.info
          ? "description-info-hover"
          : "description-info";
      } else {
        return "description";
      }
    }
  }
};
</script>

<style scoped>
.info-message {
  margin: 5px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #e1f5fe;
}

.info-message-hover {
  margin: 5px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #81d4fa;
}

.error-message {
  margin: 5px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffebee;
}

.error-message-hover {
  margin: 5px 0;
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
