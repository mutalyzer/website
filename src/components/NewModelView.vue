<template>
  <div>
    <div>
      <span class="description" v-if="description">
        {{ description }}
      </span>
    </div>
    <div>
      <span
        @mouseover="setHovers('reference.id')"
        @mouseleave="resetHovers('reference.id')"
        :class="descriptionClasses['reference.id']"
        v-if="model.reference.id"
      >
        {{ model.reference.id }}
      </span>

      <span v-if="model.reference.selector">(</span>

      <span
        :class="[getDescriptionClass('reference.selector.id')]"
        v-if="model.reference.selector"
      >
        {{ model.reference.selector.id }}
      </span>
      <span v-if="model.reference.selector">)</span>
      <span class="description">:</span>

      <span
        @mouseover="setHovers('coordinate_system')"
        @mouseleave="resetHovers('coordinate_system')"
        :class="[getDescriptionClass('coordinate_system')]"
        v-if="model.coordinate_system"
      >
        {{ model.coordinate_system }}
      </span>
      <span v-if="model.coordinate_system">.</span>

      <span
        class="description"
        v-if="model.variants && model.variants.length > 1"
        >[</span
      >

      <span class="description" v-if="model.location">
        <span
          class="description"
          v-if="model.location.type == 'point' && model.location.uncertain"
        >
          ?
        </span>
        <span
          class="description"
          v-if="model.location.type == 'point' && !model.location.uncertain"
        >
          ?
        </span>
      </span>

      <span class="description" v-if="model.variants">
        <span v-for="(variant, index) in model.variants" :key="index">
          <span class="description" v-if="variant.location">
            <span
              class="description"
              v-if="
                variant.location.type == 'point' && variant.location.uncertain
              "
            >
              ?
            </span>
            <span
              class="description"
              v-if="
                variant.location.type == 'point' && !variant.location.uncertain
              "
            >
              {{ variant.location.position }}
            </span>
          </span>
          <span class="description" v-if="variant.type != 'substitution'">
            {{ getVariantOperation(variant) }}
          </span>
        </span>
      </span>

      <span
        class="description"
        v-if="model.variants && model.variants.length > 1"
        >]</span
      >
    </div>
    <div v-for="(error, index) in errors" :key="index">
      <div class="error-message">
        {{ getMessage(error) }} <br />
        {{ getMessagePath(error) }}
      </div>
    </div>
    <div v-for="(info, index) in infos" :key="index">
      <div class="info-message">
        {{ getMessage(info) }} <br />
        {{ getMessagePath(info) }}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "NewModelView",
  props: {
    model: null,
    description: null,
    errors: null,
    infos: null
  },
  data() {
    return {
      hovers: {},
      descriptionClasses: {}
    };
  },
  created: function() {
    this.descriptionClasses["reference.id"] = this.getDescriptionClass(
      "reference.id"
    );
  },
  methods: {
    getMessage: function(message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
    },
    getMessagePath: function(message) {
      if (message.paths) {
        return message.paths;
      }
      return "";
    },
    getVariantOperation: function(variant) {
      if (variant.type == "deletion") {
        return "del";
      }
      if (variant.type == "duplication") {
        return "dup";
      }
    },
    isPoint: function(location) {
      if (location.type === "point") {
        return true;
      } else {
        return false;
      }
    },
    getDescriptionClass: function(path) {
      if (this.errors) {
        for (var error of this.errors) {
          if (error.paths) {
            for (var error_path of error.paths) {
              if (error_path.join(".") == path) {
                if (this.hovers[path]) {
                  return "description-error-hover";
                } else {
                  return "description-error";
                }
              }
            }
          }
        }
      }
      if (this.infos) {
        for (var info of this.infos) {
          if (info.paths) {
            for (var info_path of info.paths) {
              if (info_path.join(".") === path) {
                if (this.hovers[path]) {
                  return "description-info-hover";
                } else {
                  return "description-info";
                }
              }
            }
          }
        }
      }
      return "description";
    },
    setHovers: function(path) {
      console.log('setHovers');
      // this.hovers[path] = true;
      Vue.set(this.hovers, path, true);
      // this.descriptionClasses[path] = this.getDescriptionClass(path);
      Vue.set(this.descriptionClasses, path, this.getDescriptionClass(path));
      console.log("path:", path);
      console.log("hovers:", this.hovers);
      console.log("hovers[path]:", this.hovers[path]);
      console.log("class:", this.descriptionClasses[path]);
      console.log("descriptionClasses:", this.descriptionClasses);
    },
    resetHovers: function(path) {
      console.log("resetHovers", path);
      Vue.set(this.hovers, path, false);
      // this.hovers[path] = false;
      Vue.set(this.descriptionClasses, path, this.getDescriptionClass(path));
      // this.descriptionClasses[path] = this.getDescriptionClass(path);
      console.log("path:", path);
      console.log("hovers:", this.hovers);
      console.log("hovers[path]:", this.hovers[path]);
      console.log("class:", this.descriptionClasses[path]);
      console.log("descriptionClasses:", this.descriptionClasses);
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
