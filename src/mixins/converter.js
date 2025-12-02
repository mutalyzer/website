/**
 * Converter Mixin for Vue 2
 *
 * Provides HGVS coordinate conversion functions for genomic, noncoding, and coding positions.
 * Based on Mutalyzer Crossmapper: https://github.com/mutalyzer/crossmapper
 *
 */

export default {
  methods: {
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
          // c lies before this location.
          rb = i - 1;
        } else if (c >= ls[i][1]) {
          // c lies after this location.
          lb = i + 1;
        } else {
          // c lies in this location.
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

    multiLocusToCoordinate: function (position, locations, inverted = false) {
      const orientation = inverted ? -1 : 1;
      const offsets = this.getOffsets(locations, orientation);

      // Equivalent to bisect_right in Python
      let index = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (offsets[i] <= position[0]) {
          index = i;
        } else {
          break;
        }
      }

      index = Math.min(offsets.length - 1, Math.max(0, index));
      const dirIndex = this.getDirection(index, offsets, inverted);

      return this.locusToCoordinate(
        [position[0] - offsets[index], position[1]],
        locations[dirIndex],
        inverted,
      );
    },

    locusToCoordinate: function (position, location, inverted = false) {
      const boundary = [location[0], location[1] - 1];

      if (inverted) {
        return boundary[1] - position[0] - position[1];
      }
      return boundary[0] + position[0] + position[1];
    },

    coordinateToNoncoding: function (coordinate, locations, inverted = false) {
      const pos = this.multiLocusToPosition(coordinate, locations, inverted);
      return [pos[0] + 1, pos[1], pos[2]];
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

    codingToCoordinate: function (position, exons, cds, inverted = false) {
      const b0 = this.multiLocusToPosition(cds[0], exons, inverted);
      const b1 = this.multiLocusToPosition(cds[1], exons, inverted);

      let coding;
      if (inverted) {
        coding = [b1[0] + b1[1] + 1, b0[0] + b0[1] + 1];
      } else {
        coding = [b0[0] + b0[1], b1[0] + b1[1]];
      }

      if (position[2] === -1) {
        return this.multiLocusToCoordinate(
          [position[0] + coding[0], position[1]],
          exons,
          inverted,
        );
      } else if (position[2] === 1) {
        return this.multiLocusToCoordinate(
          [position[0] + coding[1] - 1, position[1]],
          exons,
          inverted,
        );
      }
      return this.multiLocusToCoordinate(
        [position[0] + coding[0] - 1, position[1]],
        exons,
        inverted,
      );
    },

    noncodingToCoordinate: function (position, locations, inverted = false) {
      if (position[0] > 0) {
        return this.multiLocusToCoordinate(
          [position[0] - 1, position[1]],
          locations,
          inverted,
        );
      }
      return this.multiLocusToCoordinate(
        [position[0], position[1]],
        locations,
        inverted,
      );
    },

    formatCodingPosition: function (coding) {
      const pos = coding[0];
      const offset = coding[1];
      const section = coding[2];

      let output = "";

      if (section === -1) {
        // 5' UTR (upstream of CDS)
        output = "-" + Math.abs(pos);
      } else if (section === 1) {
        // 3' UTR (downstream of CDS)
        output = "*" + pos;
      } else {
        // CDS region
        if (offset < 0) {
          output = pos + "-" + Math.abs(offset);
        } else if (offset > 0) {
          output = pos + "+" + offset;
        } else {
          output = pos;
        }
      }

      return output;
    },

    formatNoncodingPosition: function (noncoding) {
      const pos = noncoding[0];
      const offset = noncoding[1];

      let output = "";

      if (offset < 0) {
        output = pos + "-" + Math.abs(offset);
      } else if (offset > 0) {
        output = pos + "+" + offset;
      } else {
        output = pos;
      }

      return output;
    },

    pointToCoding(point) {
      let position = point.position;
      let section = 0;
      let offset = 0;

      if (point.outside_cds) {
        if (point.outside_cds === "upstream") {
          section = -1;
          position = -1 * position;
        } else if (point.outside_cds === "downstream") {
          section = 1;
        }
      }

      if (point.offset) {
        offset = point.offset.value;
      }

      return [position, offset, section];
    },

    getSelectorData(response) {
      if (response.selector_short) {
        const selector = response.selector_short;
        if (selector && selector.exon && selector.exon.g) {
          const inverted =
            parseInt(selector.exon.g[0][0], 10) >
            parseInt(selector.exon.g[0][1], 10);
          let exons;
          if (inverted) {
            exons = selector.exon.g
              .map((x) => [parseInt(x[1], 10) - 1, parseInt(x[0], 10)])
              .reverse();
          } else {
            exons = selector.exon.g.map((x) => [
              parseInt(x[0], 10) - 1,
              parseInt(x[1], 10),
            ]);
          }
          let cds = null;
          if (selector.cds && selector.cds.g) {
            if (inverted) {
              cds = selector.cds.g.map((x) => [
                parseInt(x[1], 10) - 1,
                parseInt(x[0], 10),
              ])[0];
            } else {
              cds = selector.cds.g.map((x) => [
                parseInt(x[0], 10) - 1,
                parseInt(x[1], 10),
              ])[0];
            }
          }
          return { exons, cds, inverted };
        }
      }
      return { exons: null, cds: null, inverted: false };
    },
  },
};
