/*
 * Copyright (c) 2011.
 *
 * Author: oldj <oldj.wu@gmail.com>
 * Blog: http://oldj.net/
 *
 * Last Update: 2011/1/10 5:22:52
 */


// _TD.a.push begin
_TD.a.push(function (TD) {

	/**
	 * Use the A* algorithm (Dijkstra algorithm?) to find the shortest route from (x1, y1) to (x2, y2)
	 *
	 */
	TD.FindWay = function (w, h, x1, y1, x2, y2, f_passable) {
		this.m = [];
		this.w = w;
		this.h = h;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.way = [];
		this.len = this.w * this.h;
		this.is_blocked = this.is_arrived = false;
		this.fPassable = typeof f_passable == "function" ? f_passable : function () {
			return true;
		};

		this._init();
	};

	TD.FindWay.prototype = {
		_init: function () {
			if (this.x1 == this.x2 && this.y1 == this.y2) {
				// If the entered coordinates are already the end point
				this.is_arrived = true;
				this.way = [
					[this.x1, this.y1]
				];
				return;
			}

			for (var i = 0; i < this.len; i++)
				this.m[i] = -2; // -2 means not explored, -1 means unreachable

			this.x = this.x1;
			this.y = this.y1;
			this.distance = 0;
			this.current = [
				[this.x, this.y]
			]; // The grid square that is currently being explored

			this.setVal(this.x, this.y, 0);

			while (this.next()) {
			}
		},
		getVal: function (x, y) {
			var p = y * this.w + x;
			return p < this.len ? this.m[p] : -1;
		},
		setVal: function (x, y, v) {
			var p = y * this.w + x;
			if (p > this.len) return false;
			this.m[p] = v;
		},
		/**
		 * Get the neighbor of the specified coordinates, that is, the grid square that can be reached within 1 step from the specified coordinates.
		 * Currently returning the top, bottom, left and right four adjacent grid squares of the specified grid square
		 * @param x {Number}
		 * @param y {Number}
		 */
		getNeighborsOf: function (x, y) {
			var nbs = [];
			if (y > 0) nbs.push([x, y - 1]);
			if (x < this.w - 1) nbs.push([x + 1, y]);
			if (y < this.h - 1) nbs.push([x, y + 1]);
			if (x > 0) nbs.push([x - 1, y]);

			return nbs;
		},
		/**
		 * Get all the neighbors of the n grid squares that are reachable in the current step
		 */
		getAllNeighbors: function () {
			var nbs = [], nb1, i, c, l = this.current.length;
			for (i = 0; i < l; i++) {
				c = this.current[i];
				nb1 = this.getNeighborsOf(c[0], c[1]);
				nbs = nbs.concat(nb1);
			}
			return nbs;
		},
		/**
		 * Push back from the end point to find the closest path from the start point to the end point
		 * The implementation here is to find the lattice with the lowest value (and greater than 0) from the neighboring cell of the current grid from the end point.
		 * until you reach the starting point.
		 * This implementation needs to find the neighbors repeatedly, sometimes the values ​​of multiple grid squares in the neighbor are the lowest, then it is from
		 * pick one randomly. Another way to do this is to add to each of the arriving grids in the initial traversal
		 * a value that points to its incoming grid (parent plaid).
		 */
		findWay: function () {
			var x = this.x2,
				y = this.y2,
				nb, max_len = this.len,
				nbs_len,
				nbs, i, l, v, min_v = -1,
				closest_nbs;

			while ((x != this.x1 || y != this.y1) && min_v != 0 &&
			this.way.length < max_len) {

				this.way.unshift([x, y]);

				nbs = this.getNeighborsOf(x, y);
				nbs_len = nbs.length;
				closest_nbs = [];

				// Find the smallest v in the neighborhood
				min_v = -1;
				for (i = 0; i < nbs_len; i++) {
					v = this.getVal(nbs[i][0], nbs[i][1]);
					if (v < 0) continue;
					if (min_v < 0 || min_v > v)
						min_v = v;
				}
				// Find out all v smallest neighbors
				for (i = 0; i < nbs_len; i++) {
					nb = nbs[i];
					if (min_v == this.getVal(nb[0], nb[1])) {
						closest_nbs.push(nb);
					}
				}

				// Randomly select one from v the smallest neighbor as the current grid
				l = closest_nbs.length;
				i = l > 1 ? Math.floor(Math.random() * l) : 0;
				nb = closest_nbs[i];

				x = nb[0];
				y = nb[1];
			}
		},
		/**
		 * reach destination
		 */
		arrive: function () {
			this.current = [];
			this.is_arrived = true;

			this.findWay();
		},
		/**
		 * the road is blocked
		 */
		blocked: function () {
			this.current = [];
			this.is_blocked = true;
		},
		/**
		 * Next iteration
		 * @return {Boolean} If the return value is true , it means that the end point has not been reached, and the road
         * is not blocked, you can continue iterating; otherwise it means you don't have to continue iterating
		 */
		next: function () {
			var neighbors = this.getAllNeighbors(), nb,
				l = neighbors.length,
				valid_neighbors = [],
				x, y,
				i, v;

			this.distance++;

			for (i = 0; i < l; i++) {
				nb = neighbors[i];
				x = nb[0];
				y = nb[1];
				if (this.getVal(x, y) != -2) continue; // The current grid square has been explored
				//grid = this.map.getGrid(x, y);
				//if (!grid) continue;

				if (this.fPassable(x, y)) {
					// 可通过

					/**
					 * Cost from the starting point to the current grid
					 * Here is simply a matter of taking a few steps from the starting point to the current grid.
					 * In more complicated situations, it may be necessary to consider that different roads will cost differently.
					 * For example, the swamp is more expensive than the flat. However, the road conditions in the current version are not so complicated,
					 * do not consider it first.
					 */
					v = this.distance;

					valid_neighbors.push(nb);
				} else {
					// Cannot pass or block the building
					v = -1;
				}

				this.setVal(x, y, v);

				if (x == this.x2 && y == this.y2) {
					this.arrive();
					return false;
				}
			}

			if (valid_neighbors.length == 0) {
				this.blocked();
				return false
			}
			this.current = valid_neighbors;

			return true;
		}
	};

}); // _TD.a.push end


