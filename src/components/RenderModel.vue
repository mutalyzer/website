<script>
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
      someText: "AAAA"
    };
  },
  render(createElement) {
    function recursive(model) {
      for (var k of Object.keys(model)) {
        if (k == "reference") {
          recursive(model[k]);
          console.log(":");
        }
        if (k == "selector") {
          console.log("(");
          recursive(model[k]);
          console.log(")");
        }
        if (k == "id") {
          console.log(model[k]);
          // return createElement("span", model[k])
        }
        if (k == "coordinate_system") {
          console.log(model[k]);
          console.log(".");
          // return recursive("span", model[k] + '.')
        }
        if (k == "variants") {
          if (model[k].length > 1) {
            console.log("[");
          }
          recursive(model[k]);
          if (model[k].length > 1) {
            console.log("[");
          }
        }
        if (k == "location") {
          if (model[k].length > 1) {
            console.log("[");
          }
          recursive(model[k]);
          if (model[k].length > 1) {
            console.log("[");
          }
        }
      }
    }

    // function get_elements(model) {
    //   var node
    //   for (var k of Object.keys(model)) {
    //     console.log('- k:', k)
    //     if (["reference"].includes(k)) {
    //       node = createElement("span", [get_elements(model[k])])
    //     }
    //     if (k == "id") {
    //       console.log('- id: ', model[k])
    //       node = createElement("span", model[k])
    //     }
    //     if (k == "coordinate_system") {
    //       console.log('- coordinate_system: ', model[k])
    //       node = createElement("span", model[k] + '.')
    //     }
    //   }
    //   return node
    // }

    function getLocation(location) {
      var node = [];
      if (location.type === "point") {
        node.push(getPoint(location));
      } else if (location.type == "range") {
        node.push(getRange(location));
      }
      console.log("- location node", node);
      return createElement("span", {}, node);
    }

    function getRange(location) {
      var node = [];
      if (location.uncertain) {
        node.push(createElement("span", "("));
      }
      if (location.start.type === "point") {
        node.push(createElement("span", getPoint(location.start)));
      } else if (location.start.type === "range") {
        node.push(getRange(location.start));
      }
      node.push(createElement("span", "_"));
      if (location.end.type === "point") {
        node.push(createElement("span", getPoint(location.end)));
      } else if (location.end.type === "range") {
        node.push(getRange(location.end));
      }
      if (location.uncertain) {
        node.push(createElement("span", ")"));
      }
      return createElement("span", {}, node);
    }

    function getPoint(point) {
      var node = [];
      if (point.uncertain) {
        node.push(createElement("span", "?"));
      } else {
        if (point.outside_cds && point.outside_cds === "downstream") {
          node.push(createElement("span", "*"));
        }
        if (point.position) {
          console.log("- point position", point.position);
          node.push(createElement("span", point.position));
        }
        if (point.offset && point.offset.value) {
          if (point.offset.value > 0) {
            node.push(createElement("span", "+" + point.offset.value));
          } else {
            node.push(createElement("span", point.offset.value));
          }
        }
      }
      return createElement("span", {}, node);
    }

    function getVariant(variant) {
      var node = [];
      if (variant.location) {
        node.push(createElement("span", getLocation(variant.location)));
      }
      // if (variant.type) {
      //   if (variant.type == "substitution") {
      //     output.push(...this.getDeleted(variant.deleted));
      //     output.push({ view: ">" });
      //   }
      // if (variant.type == "deletion") {
      //   output.push({ view: "del" });
      // }
      // if (variant.type == "insertion") {
      //   output.push({ view: "ins" });
      // }
      // if (variant.inserted) {
      //   var inserted = this.getInserted(variant.inserted);
      //   if (inserted.length > 1) {
      //     output.push({ view: "[" });
      //     for (var i in inserted) {
      //       if (Array.isArray(inserted[i])) {
      //         output.push(...inserted[i]);
      //       } else {
      //         output.push(inserted[i]);
      //       }
      //       if (i < inserted.length - 1) {
      //         output.push({ view: ";" });
      //       }
      //     }
      //     output.push({ view: "]" });
      //   } else {
      //     output.push(...inserted);
      // }

      console.log("- variant node", node);
      return createElement("span", {}, node);
    }

    function getDescription(model) {
      var node = [];
      if (model) {
        if (model.reference) {
          console.log("- reference");
          node.push(
            createElement("span", [getDescription(model.reference), ":"])
          );
        }
        if (model.id) {
          console.log("- id", model.id);
          node.push(model.id);
        }
        if (model.selector) {
          node.push(
            createElement("span", ["(", getDescription(model.selector), ")"])
          );
        }
        if (model.coordinate_system) {
          node.push(createElement("span", [model.coordinate_system, "."]));
        }
        if (model.location) {
          console.log("ff");
          node.push(createElement("span", "["));
          node.push(createElement("span", {}, getLocation(model.location)));
        }
        if (model.variants) {
          if (model.variants.length > 1) {
            node.push(createElement("span", "["));
          }
          var variants = [];
          for (var i in model.variants) {
            variants.push(createElement("span", getVariant(model.variants[i])));
          }
          node.push(...variants);
          if (model.variants.length > 1) {
            node.push(createElement("span", "]"));
          }
        }
      }
      return createElement("span", node);
    }

    console.log(this.model);
    const counter = createElement("span", [
      "one",
      createElement("span", ["two"])
    ]);
    console.log("--- counter", counter);

    console.log("---- recursive");
    recursive(this.model);

    // console.log('.....')
    // var elements = createElement("span", [get_elements( this.model)])
    // console.log('- elements:', elements)
    // console.log('.....')

    var text = createElement("div", this.someText);

    var inputText = createElement("input", {
      domProps: { value: this.someText }
    });

    var inputText2 = createElement(
      "input",
      {
        domProps: { value: this.model.reference.id }
      },
      this.model.reference.id
    );

    console.log("..... getDescription");
    var elements = getDescription(this.model);
    console.log("- elements:", elements);
    console.log(".....");

    return createElement("div", {}, [inputText, inputText2, text, elements]);
    // return createElement('div', {}, ['gfgdfg', counter, model])
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
