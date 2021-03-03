export default {
  methods: {
    modelToDescription(model) {
      let reference = "";
      if (model.reference.id) {
        reference += model.reference.id;
      } else if (model.source) {
        reference += model.source.id;
      }
      let selector_id = this.getSelectorId(model);
      if (selector_id) {
        reference += "(" + selector_id + ")";
      }
      reference += ":";
      if (model.coordinate_system) {
        reference += model.coordinate_system + ".";
      }
      if (model.variants) {
        reference += this.variantsToDescription(model.variants);
      }
      return reference;
    },
    getSelectorId(model) {
      if (
        model.reference &&
        model.reference.selector &&
        model.reference.selector.id
      ) {
        return model.reference.selector.id;
      } else if (
        model.source &&
        model.source.selector &&
        model.source.selector.id
      ) {
        return model.source.selector.id;
      }
    },
    variantsToDescription(variants) {
      let variants_list = [];
      for (let variant of variants) {
        variants_list.push(this.variantToDescription(variant));
      }
      if (variants_list.length > 1) {
        return "[" + variants_list.join(",") + "]";
      } else if (variants_list.length == 1) {
        return variants_list[0];
      }
    },

    variantToDescription(variant) {
      let deleted_location = "";
      let deleted = "";
      let inserted = "";
      if (variant.location) {
        deleted_location = this.locationToDescription(variant.location);
      }
      if (variant.inserted) {
        inserted = this.insertedToDescription(variant.inserted);
        if (
          variant.type == "repeat" &&
          variant.inserted.length == 1 &&
          ((variant.inserted[0].location && !variant.inserted[0].sequence) ||
            (variant.inserted[0].sequence && variant.inserted[0].length.value))
        ) {
          inserted = "[" + inserted + "]";
        }
      }
      if (variant.deleted) {
        deleted = this.insertedToDescription(variant.deleted);
      }

      let variant_type = "";
      if (variant.type == "substitution") {
        variant_type = deleted + ">";
      } else if (variant.type == "deletioin") {
        variant_type == "del" + deleted;
      } else if (variant.type == "deletion_insertion") {
        variant_type == "del" + deleted + "ins";
      } else if (variant.type == "insertion") {
        variant_type == "ins";
      } else if (variant.type == "duplication") {
        variant_type == "dup" + inserted;
        inserted = "";
      } else if (variant.type == "inversion") {
        variant_type == "inv";
      } else if (variant.type == "conversion") {
        variant_type == "con";
      } else if (variant.type == "equal") {
        variant_type == "=";
      }
      return deleted_location + variant_type + inserted;
    },

    insertedToDescription(inserted) {
      let descriptions = [];
      for (let insert of inserted) {
        if (insert.sequence) {
          descriptions.push(insert.sequence);
        } else if (insert.source && insert.source.constructor == Object) {
          descriptions.push(this.modelToDescription(insert));
        } else if (insert.location) {
          descriptions.push(this.locationToDescription(insert.location));
        } else if (insert.length) {
          descriptions.push(this.lengthToDescription(insert.length));
        } else if (insert.repeat_number) {
          descriptions[descriptions.length - 1] +=
            "[" + insert.repeat_number.value + "]";
        } else if (insert.inverted) {
          descriptions[descriptions.length - 1] += "inv";
        }
      }
      if (inserted.length > 1) {
        return "[" + descriptions.join(",") + "]";
      } else {
        return descriptions[0];
      }
    },
    locationToDescription(location) {
      if (location.type == "point") {
        return this.pointToDescription(location);
      }
      if (location.type == "range") {
        if (location.uncertain) {
          return (
            "(" +
            this.pointToDescription(location.start) +
            "_" +
            this.pointToDescription(location.end) +
            ")"
          );
        } else {
          return (
            this.pointToDescription(location.start) +
            "_" +
            this.pointToDescription(location.end)
          );
        }
      }
    },
    pointToDescription(point) {
      let outside_cds = "";
      let offset = "";
      let position = "";
      if (point.outside_cds) {
        if (point.outside_cds == "downstream") {
          outside_cds = "*";
        } else if (point.outside_cds == "upstream") {
          outside_cds = "-";
        }
      }
      if (point.uncertain) {
        position = "?";
      } else {
        position = String(point.position);
      }
      if (point.offset) {
        if (point.offset.value) {
          offset = point.offset.value;
        } else if (point.offset.uncertain) {
          if (point.offset.upstream) {
            offset = "-?";
          } else if (point.offset.downstream) {
            offset = "+?";
          }
        }
      }
      return outside_cds + position + offset;
    },
    lengthToDescription(length) {
      if (length.type == "point") {
        if (length.value) {
          return String(length.value);
        } else if (length.uncertain) {
          return "?";
        }
      }
      if (length.type == "range") {
        let output =
          this.lengthToDescription(length.start) +
          "_" +
          this.lengthToDescription(length.end);
        if (length.uncertain) {
          return "(" + output + ")";
        } else {
          return output;
        }
      }
    },
  },
};
