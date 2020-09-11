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
            output.push({ view: "(" });
            output.push(this.getSelector(model.reference.selector));
            output.push({ view: ")" });
          }
        }
        output.push({ view: ":" });
        if (model.coordinate_system) {
          output.push(this.getCoordinateSystem(model));
          output.push({ view: "." });
        }
        if (model.location) {
          output.push(...this.getLocation(model.location));
        }
        if (model.variants) {
          output.push(...this.getVariants(model.variants));
        }
      }
      return output;
    },
    addMessages: function(output, node) {
      if (node.errors) {
        output.errors = node.errors;
      }
      if (node.info) {
        output.info = node.info;
      }
    },
    getReference: function(reference) {
      const output = {};
      this.addMessages(output, reference);
      if (reference.id) {
        output.view = reference.id;
      }
      output.hover = false;
      return output;
    },
    getSelector: function(selector) {
      const output = {};
      this.addMessages(output, selector);
      if (selector.id) {
        output.view = selector.id;
      }
      output.hover = false;
      return output;
    },
    getCoordinateSystem: function(model) {
      const output = {};
      this.addMessages(output, model);
      if (model.coordinate_system) {
        output.view = model.coordinate_system;
      }
      output.hover = false;
      return output;
    },
    getVariants: function(variants) {
      const output = [];
      for (var i in variants) {
        output.push(...this.getVariant(variants[i]));
      }
      return output;
    },
    getVariant: function(variant) {
      const output = [];
      if (variant.location) {
        output.push(...this.getLocation(variant.location));
      }
      if (variant.type) {
        if (variant.type == "substitution") {
          output.push(...this.getDeleted(variant.deleted));
          output.push({ view: ">" });
        }
        if (variant.type == "deletion") {
          output.push({ view: "del" });
        }
        if (variant.type == "insertion") {
          output.push({ view: "ins" });
        }
        if (variant.inserted) {
          var inserted = this.getInserted(variant.inserted);
          if (inserted.length > 1) {
            output.push({ view: "[" });
            for (var i in inserted) {
              if (Array.isArray(inserted[i])) {
                output.push(...inserted[i]);
              } else {
                output.push(inserted[i]);
              }
              if (i < inserted.length - 1) {
                output.push({ view: ";" });
              }
            }
            output.push({ view: "]" });
          } else {
            output.push(...inserted);
          }
        }
      }
      return output;
    },
    getDeleted: function(deleted) {
      const output = [];
      if (Array.isArray(deleted)) {
        for (var i in deleted) {
          output.push(...this.getDeleted(deleted[i]));
        }
      } else {
        if (deleted.sequence) {
          return [{ view: deleted.sequence }];
        }
      }
      return output;
    },
    getInserted: function(inserted) {
      const output = [];
      if (Array.isArray(inserted)) {
        for (var i in inserted) {
          output.push(this.getInserted(inserted[i]));
        }
      } else {
        if (inserted.source == "description") {
          if (inserted.sequence) {
            return { view: inserted.sequence };
          }
        } else if (inserted.source == "reference") {
          if (inserted.location) {
            output.push(...this.getLocation(inserted.location));
          }
          if (inserted.inverted) {
            output.push({ view: "inv" });
          }
        } else {
          output.push(this.getReference(inserted.source));
          if (inserted.source.selector) {
            output.push({ view: "(" });
            output.push(this.getSelector(inserted.source.selector));
            output.push({ view: ")" });
          }
          if (inserted.location) {
            output.push({ view: ":" });
            if (inserted.coordinate_system) {
              output.push(this.getCoordinateSystem(inserted));
              output.push({ view: "." });
            }
            output.push(...this.getLocation(inserted.location));
          }
          if (inserted.inverted) {
            output.push({ view: "inv" });
          }
        }
      }
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
        output.push(...this.getRange(location.start));
      }
      output.push({ view: "_" });
      if (location.end.type === "point") {
        output.push(this.getPoint(location.end));
      } else if (location.end.type === "range") {
        output.push(...this.getRange(location.end));
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
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #e1f5fe;
}

.info-message-hover {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #81d4fa;
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
