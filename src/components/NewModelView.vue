<template>
  <div>
    <div>
      <span class="description" v-if="description">
        {{ description }}
      </span>
    </div>
    <div>
      <span class="description" v-if="model.reference.id">
        {{ model.reference.id }}
      </span>
      <span class="description" v-if="model.reference.selector">
        {{ "(" + model.reference.selector.id + ")" }}
      </span>
      <span class="description">:</span>
      <span class="description" v-if="model.coordinate_system">
        {{ model.coordinate_system + "." }}
      </span>
      <span
        class="description"
        v-if="model.variants && model.variants.length > 1"
        >[</span
      >
      <span class="description" v-if="model.variants">
        <span v-for="(variant, index) in model.variants" :key="index">
          <span class="description" v-if="variant.location">
            location
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
export default {
  name: "NewModelView",
  props: {
    model: null,
    description: null,
    errors: null,
    infos: null
  },
  created: function() {
    this.linkErrors();
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
    linkErrors: function() {
      for (var k of Object.keys(this.model)) {
        if (k == "reference") {
          console.log(k)
          console.log(":");
        }
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
