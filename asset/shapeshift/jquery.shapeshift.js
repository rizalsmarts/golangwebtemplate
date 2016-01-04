// Generated by CoffeeScript 1.4.0
(function() {

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "shapeshift";
    defaults = {
      selector: "*",
      enableDrag: true,
      enableCrossDrop: true,
      enableResize: true,
      enableTrash: false,
      align: "left",
      colWidth: null,
      columns: null,
      minColumns: 12,
      autoHeight: true,
      maxHeight: null,
      minHeight: 100,
      gutterX: 0,
      gutterY: 0,
      paddingX: 0,
      paddingY: 0,
      animated: true,
      animateOnInit: false,
      animationSpeed: 225,
      animationThreshold: 100,
      dragClone: false,
      deleteClone: true,
      dragRate: 100,
      dragWhitelist: "*",
      crossDropWhitelist: "*",
      cutoffStart: null,
      cutoffEnd: null,
      handle: false,
      cloneClass: "ss-cloned-child",
      activeClass: "ss-active-child",
      draggedClass: "ss-dragged-child",
      placeholderClass: "ss-placeholder-child",
      originalContainerClass: "ss-original-container",
      currentContainerClass: "ss-current-container",
      previousContainerClass: "ss-previous-container"
    };
    Plugin = (function() {

      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.globals = {};
        this.$container = $(element);
        if (this.errorCheck()) {
          this.init();
        }
      }

      Plugin.prototype.errorCheck = function() {
        var $children, error_msg, errors, options;
        options = this.options;
        errors = false;
        error_msg = "Shapeshift ERROR:";
        if (options.colWidth === null) {
          $children = this.$container.children(options.selector);
          if ($children.length === 0) {
            errors = true;
            console.error("" + error_msg + " option colWidth must be specified if Shapeshift is initialized with no active children.");
          }
        }
        return !errors;
      };

      Plugin.prototype.init = function() {
        this.createEvents();
        this.setGlobals();
        this.setIdentifier();
        this.setActiveChildren();
        this.enableFeatures();
        this.gridInit();
        this.render();
        return this.afterInit();
      };

      Plugin.prototype.createEvents = function() {
        var $container, options,
          _this = this;
        options = this.options;
        $container = this.$container;
        $container.off("ss-arrange").on("ss-arrange", function(e, trigger_drop_finished) {
          if (trigger_drop_finished == null) {
            trigger_drop_finished = false;
          }
          return _this.render(false, trigger_drop_finished);
        });
        $container.off("ss-rearrange").on("ss-rearrange", function() {
          return _this.render(true);
        });
        $container.off("ss-setTargetPosition").on("ss-setTargetPosition", function() {
          return _this.setTargetPosition();
        });
        $container.off("ss-destroy").on("ss-destroy", function() {
          return _this.destroy();
        });
        return $container.off("ss-shuffle").on("ss-shuffle", function() {
          return _this.shuffle();
        });
      };

      Plugin.prototype.setGlobals = function() {
        this.globals.animated = this.options.animateOnInit;
        return this.globals.dragging = false;
      };

      Plugin.prototype.afterInit = function() {
        return this.globals.animated = this.options.animated;
      };

      Plugin.prototype.setIdentifier = function() {
        this.identifier = "shapeshifted_container_" + Math.random().toString(36).substring(7);
        return this.$container.addClass(this.identifier);
      };

      Plugin.prototype.enableFeatures = function() {
        if (this.options.enableResize) {
          this.enableResize();
        }
        if (this.options.enableDrag || this.options.enableCrossDrop) {
          return this.enableDragNDrop();
        }
      };

      Plugin.prototype.setActiveChildren = function() {
        var $children, active_child_class, colspan, columns, i, min_columns, options, total, _i, _j, _ref, _results;
        options = this.options;
        $children = this.$container.children(options.selector);
        active_child_class = options.activeClass;
        total = $children.length;
        for (i = _i = 0; 0 <= total ? _i < total : _i > total; i = 0 <= total ? ++_i : --_i) {
          $($children[i]).addClass(active_child_class);
        }
        this.setParsedChildren();
        columns = options.columns;
        _results = [];
        for (i = _j = 0, _ref = this.parsedChildren.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
          colspan = this.parsedChildren[i].colspan;
          min_columns = options.minColumns;
          if (colspan > columns && colspan > min_columns) {
            options.minColumns = colspan;
            _results.push(console.error("Shapeshift ERROR: There are child elements that have a larger colspan than the minimum columns set through options.\noptions.minColumns has been set to " + colspan));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Plugin.prototype.setParsedChildren = function() {
        var $child, $children, child, i, parsedChildren, total, _i;
        $children = this.$container.find("." + this.options.activeClass).filter(":visible");
        total = $children.length;
        parsedChildren = [];
        for (i = _i = 0; 0 <= total ? _i < total : _i > total; i = 0 <= total ? ++_i : --_i) {
          $child = $($children[i]);
          child = {
            i: i,
            el: $child,
            colspan: parseInt($child.attr("data-ss-colspan")) || 1,
            height: $child.outerHeight()
          };
          parsedChildren.push(child);
        }
        return this.parsedChildren = parsedChildren;
      };

      Plugin.prototype.gridInit = function() {
        var fc_colspan, fc_width, first_child, gutter_x, single_width;
        gutter_x = this.options.gutterX;
        if (!(this.options.colWidth >= 1)) {
          first_child = this.parsedChildren[0];
          fc_width = first_child.el.outerWidth();
          fc_colspan = first_child.colspan;
          single_width = (fc_width - ((fc_colspan - 1) * gutter_x)) / fc_colspan;
          return this.globals.col_width = single_width + gutter_x;
        } else {
          return this.globals.col_width = this.options.colWidth + gutter_x;
        }
      };

      Plugin.prototype.render = function(reparse, trigger_drop_finished) {
        if (reparse == null) {
          reparse = false;
        }
        if (reparse) {
          this.setActiveChildren();
        }
        this.setGridColumns();
        return this.arrange(false, trigger_drop_finished);
      };

      Plugin.prototype.setGridColumns = function() {
        var actual_columns, children_count, col_width, colspan, columns, globals, grid_width, gutter_x, i, inner_width, minColumns, options, padding_x, _i, _ref;
        globals = this.globals;
        options = this.options;
        col_width = globals.col_width;
        gutter_x = options.gutterX;
        padding_x = options.paddingX;
        inner_width = this.$container.innerWidth() - (padding_x * 2);
        minColumns = options.minColumns;
        columns = options.columns || Math.floor((inner_width + gutter_x) / col_width);
        if (minColumns && minColumns > columns) {
          columns = minColumns;
        }
        globals.columns = columns;
        children_count = this.parsedChildren.length;
        if (columns > children_count) {
          actual_columns = 0;
          for (i = _i = 0, _ref = this.parsedChildren.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            colspan = this.parsedChildren[i].colspan;
            if (colspan + actual_columns <= columns) {
              actual_columns += colspan;
            }
          }
          columns = actual_columns;
        }
        globals.child_offset = padding_x;
        switch (options.align) {
          case "center":
            grid_width = (columns * col_width) - gutter_x;
            return globals.child_offset += (inner_width - grid_width) / 2;
          case "right":
            grid_width = (columns * col_width) - gutter_x;
            return globals.child_offset += inner_width - grid_width;
        }
      };

      Plugin.prototype.arrange = function(reparse, trigger_drop_finished) {
        var $child, $container, animated, animation_speed, attributes, child_positions, container_height, dragged_class, globals, i, is_dragged_child, max_height, min_height, options, parsed_children, placeholder_class, total_children, _i;
        if (reparse) {
          this.setParsedChildren();
        }
        globals = this.globals;
        options = this.options;
        $container = this.$container;
        child_positions = this.getPositions();
        parsed_children = this.parsedChildren;
        total_children = parsed_children.length;
        animated = globals.animated && total_children <= options.animationThreshold;
        animation_speed = options.animationSpeed;
        dragged_class = options.draggedClass;
        for (i = _i = 0; 0 <= total_children ? _i < total_children : _i > total_children; i = 0 <= total_children ? ++_i : --_i) {
          $child = parsed_children[i].el;
          attributes = child_positions[i];
          is_dragged_child = $child.hasClass(dragged_class);
          if (is_dragged_child) {
            placeholder_class = options.placeholderClass;
            $child = $child.siblings("." + placeholder_class);
          }
          if (animated && !is_dragged_child) {
            $child.stop(true, false).animate(attributes, animation_speed, function() {});
          } else {
            $child.css(attributes);
          }
        }
        if (trigger_drop_finished) {
          if (animated) {
            setTimeout((function() {
              return $container.trigger("ss-drop-complete");
            }), animation_speed);
          } else {
            $container.trigger("ss-drop-complete");
          }
        }
        $container.trigger("ss-arranged");
        if (options.autoHeight) {
          container_height = globals.container_height;
          max_height = options.maxHeight;
          min_height = options.minHeight;
          if (min_height && container_height < min_height) {
            container_height = min_height;
          } else if (max_height && container_height > max_height) {
            container_height = max_height;
          }
          return $container.height(container_height);
        }
      };

      Plugin.prototype.getPositions = function(include_dragged) {
        var col_heights, determineMultiposition, determinePositions, dragged_class, globals, grid_height, gutter_y, i, options, padding_y, parsed_children, positions, recalculateSavedChildren, savePosition, saved_children, total_children, _i, _ref,
          _this = this;
        if (include_dragged == null) {
          include_dragged = true;
        }
        globals = this.globals;
        options = this.options;
        gutter_y = options.gutterY;
        padding_y = options.paddingY;
        dragged_class = options.draggedClass;
        parsed_children = this.parsedChildren;
        total_children = parsed_children.length;
        col_heights = [];
        for (i = _i = 0, _ref = globals.columns; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          col_heights.push(padding_y);
        }
        savePosition = function(child) {
          var col, colspan, j, offset_x, offset_y, _j, _results;
          col = child.col;
          colspan = child.colspan;
          offset_x = (child.col * globals.col_width) + globals.child_offset;
          offset_y = col_heights[col];
          positions[child.i] = {
            left: offset_x,
            top: offset_y
          };
          col_heights[col] += child.height + gutter_y;
          if (colspan >= 1) {
            _results = [];
            for (j = _j = 1; 1 <= colspan ? _j < colspan : _j > colspan; j = 1 <= colspan ? ++_j : --_j) {
              _results.push(col_heights[col + j] = col_heights[col]);
            }
            return _results;
          }
        };
        determineMultiposition = function(child) {
          var chosen_col, col, colspan, height, kosher, next_height, offset, possible_col_heights, possible_cols, span, _j, _k;
          possible_cols = col_heights.length - child.colspan + 1;
          possible_col_heights = col_heights.slice(0).splice(0, possible_cols);
          chosen_col = void 0;
          for (offset = _j = 0; 0 <= possible_cols ? _j < possible_cols : _j > possible_cols; offset = 0 <= possible_cols ? ++_j : --_j) {
            col = _this.lowestCol(possible_col_heights, offset);
            colspan = child.colspan;
            height = col_heights[col];
            kosher = true;
            for (span = _k = 1; 1 <= colspan ? _k < colspan : _k > colspan; span = 1 <= colspan ? ++_k : --_k) {
              next_height = col_heights[col + span];
              if (height < next_height) {
                kosher = false;
                break;
              }
            }
            if (kosher) {
              chosen_col = col;
              break;
            }
          }
          return chosen_col;
        };
        saved_children = [];
        recalculateSavedChildren = function() {
          var index, pop_i, saved_child, saved_i, to_pop, _j, _k, _ref1, _ref2, _results;
          to_pop = [];
          for (saved_i = _j = 0, _ref1 = saved_children.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; saved_i = 0 <= _ref1 ? ++_j : --_j) {
            saved_child = saved_children[saved_i];
            saved_child.col = determineMultiposition(saved_child);
            if (saved_child.col >= 0) {
              savePosition(saved_child);
              to_pop.push(saved_i);
            }
          }
          _results = [];
          for (pop_i = _k = _ref2 = to_pop.length - 1; _k >= 0; pop_i = _k += -1) {
            index = to_pop[pop_i];
            _results.push(saved_children.splice(index, 1));
          }
          return _results;
        };
        positions = [];
        (determinePositions = function() {
          var child, _j, _results;
          _results = [];
          for (i = _j = 0; 0 <= total_children ? _j < total_children : _j > total_children; i = 0 <= total_children ? ++_j : --_j) {
            child = parsed_children[i];
            if (!(!include_dragged && child.el.hasClass(dragged_class))) {
              if (child.colspan > 1) {
                child.col = determineMultiposition(child);
              } else {
                child.col = _this.lowestCol(col_heights);
              }
              if (child.col === void 0) {
                saved_children.push(child);
              } else {
                savePosition(child);
              }
              _results.push(recalculateSavedChildren());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        })();
        if (options.autoHeight) {
          grid_height = col_heights[this.highestCol(col_heights)] - gutter_y;
          globals.container_height = grid_height + padding_y;
        }
        return positions;
      };

      Plugin.prototype.enableDragNDrop = function() {
        var $clone, $container, $placeholder, $selected, active_class, clone_class, current_container_class, delete_clone, drag_clone, drag_rate, drag_timeout, dragged_class, options, original_container_class, placeholder_class, previous_container_class, selected_offset_x, selected_offset_y,
          _this = this;
        options = this.options;
        $container = this.$container;
        active_class = options.activeClass;
        dragged_class = options.draggedClass;
        placeholder_class = options.placeholderClass;
        original_container_class = options.originalContainerClass;
        current_container_class = options.currentContainerClass;
        previous_container_class = options.previousContainerClass;
        delete_clone = options.deleteClone;
        drag_rate = options.dragRate;
        drag_clone = options.dragClone;
        clone_class = options.cloneClass;
        $selected = $placeholder = $clone = selected_offset_y = selected_offset_x = null;
        drag_timeout = false;
        if (options.enableDrag) {
          $container.children("." + active_class).filter(options.dragWhitelist).draggable({
            addClasses: false,
            containment: 'document',
            handle: options.handle,
            zIndex: 9999,
            start: function(e, ui) {
              var selected_tag;
              _this.globals.dragging = true;
              $selected = $(e.target);
              if (drag_clone) {
                $clone = $selected.clone(false, false).insertBefore($selected).addClass(clone_class);
              }
              $selected.addClass(dragged_class);
              selected_tag = $selected.prop("tagName");
              $placeholder = $("<" + selected_tag + " class='" + placeholder_class + "' style='height: " + ($selected.height()) + "px; width: " + ($selected.width()) + "px'></" + selected_tag + ">");
              $selected.parent().addClass(original_container_class).addClass(current_container_class);
              selected_offset_y = $selected.outerHeight() / 2;
              return selected_offset_x = $selected.outerWidth() / 2;
            },
            drag: function(e, ui) {
              if (!drag_timeout && !(drag_clone && delete_clone && $("." + current_container_class)[0] === $("." + original_container_class)[0])) {
                $placeholder.remove().appendTo("." + current_container_class);
                $("." + current_container_class).trigger("ss-setTargetPosition");
                drag_timeout = true;
                window.setTimeout((function() {
                  return drag_timeout = false;
                }), drag_rate);
              }
              ui.position.left = e.pageX - $selected.parent().offset().left - selected_offset_x;
              return ui.position.top = e.pageY - $selected.parent().offset().top - selected_offset_y;
            },
            stop: function() {
              var $current_container, $original_container, $previous_container;
              _this.globals.dragging = false;
              $original_container = $("." + original_container_class);
              $current_container = $("." + current_container_class);
              $previous_container = $("." + previous_container_class);
              $selected.removeClass(dragged_class);
              $("." + placeholder_class).remove();
              if (drag_clone) {
                if (delete_clone && $("." + current_container_class)[0] === $("." + original_container_class)[0]) {
                  $clone.remove();
                  $("." + current_container_class).trigger("ss-rearrange");
                } else {
                    $clone.removeClass(clone_class);
                    $original_container.shapeshift($original_container.data("plugin_shapeshift").options);
                    $current_container.shapeshift($current_container.data("plugin_shapeshift").options);
                }
              }
              if ($original_container[0] === $current_container[0]) {
                $current_container.trigger("ss-rearranged", $selected);
              } else {
                $original_container.trigger("ss-removed", $selected);
                $current_container.trigger("ss-added", $selected);
              }
              $original_container.trigger("ss-arrange").removeClass(original_container_class);
              $current_container.trigger("ss-arrange", true).removeClass(current_container_class);
              $previous_container.trigger("ss-arrange").removeClass(previous_container_class);
              return $selected = $placeholder = null;
            }
          });
        }
        if (options.enableCrossDrop) {
          return $container.droppable({
            accept: options.crossDropWhitelist,
            tolerance: 'intersect',
            over: function(e) {
              $("." + previous_container_class).removeClass(previous_container_class);
              $("." + current_container_class).removeClass(current_container_class).addClass(previous_container_class);
              return $(e.target).addClass(current_container_class);
            },
            drop: function(e, selected) {
              var $current_container, $original_container, $previous_container;
              if (_this.options.enableTrash) {
                $original_container = $("." + original_container_class);
                $current_container = $("." + current_container_class);
                $previous_container = $("." + previous_container_class);
                $selected = $(selected.helper);
                $current_container.trigger("ss-trashed", $selected);
                $selected.remove();
                $original_container.trigger("ss-rearrange").removeClass(original_container_class);
                $current_container.trigger("ss-rearrange").removeClass(current_container_class);
                return $previous_container.trigger("ss-arrange").removeClass(previous_container_class);
              }
            }
          });
        }
      };

      Plugin.prototype.setTargetPosition = function() {
        var $selected, $start_container, $target, attributes, child_positions, cutoff_end, cutoff_start, distance, dragged_class, options, parsed_children, placeholder_class, position_i, previous_container_class, selected_x, selected_y, shortest_distance, target_position, total_positions, x_dist, y_dist, _i;
        options = this.options;
        if (!options.enableTrash) {
          dragged_class = options.draggedClass;
          $selected = $("." + dragged_class);
          $start_container = $selected.parent();
          parsed_children = this.parsedChildren;
          child_positions = this.getPositions(false);
          total_positions = child_positions.length;
          selected_x = $selected.offset().left - $start_container.offset().left + (this.globals.col_width / 2);
          selected_y = $selected.offset().top - $start_container.offset().top + ($selected.height() / 2);
          shortest_distance = 9999999;
          target_position = 0;
          if (total_positions > 1) {
            cutoff_start = options.cutoffStart + 1 || 0;
            cutoff_end = options.cutoffEnd || total_positions;
            for (position_i = _i = cutoff_start; cutoff_start <= cutoff_end ? _i < cutoff_end : _i > cutoff_end; position_i = cutoff_start <= cutoff_end ? ++_i : --_i) {
              attributes = child_positions[position_i];
              if (attributes) {
                y_dist = selected_x - attributes.left;
                x_dist = selected_y - attributes.top;
                if (y_dist > 0 && x_dist > 0) {
                  distance = Math.sqrt((x_dist * x_dist) + (y_dist * y_dist));
                  if (distance < shortest_distance) {
                    shortest_distance = distance;
                    target_position = position_i;
                    if (position_i === total_positions - 1) {
                      if (y_dist > parsed_children[position_i].height / 2) {
                        target_position++;
                      }
                    }
                  }
                }
              }
            }
            if (target_position === parsed_children.length) {
              $target = parsed_children[target_position - 1].el;
              $selected.insertAfter($target);
            } else {
              $target = parsed_children[target_position].el;
              $selected.insertBefore($target);
            }
          } else {
            if (total_positions === 1) {
              attributes = child_positions[0];
              if (attributes.left < selected_x) {
                this.$container.append($selected);
              } else {
                this.$container.prepend($selected);
              }
            } else {
              this.$container.append($selected);
            }
          }
          this.arrange(true);
          if ($start_container[0] !== $selected.parent()[0]) {
              previous_container_class = options.previousContainerClass;
              if ($("." + previous_container_class).data("plugin_shapeshift").options.enableCrossDrop == true) {
                  return $("." + previous_container_class).trigger("ss-rearrange");
              } else {
                  return $("." + previous_container_class);
              }
          }
        } else {
          placeholder_class = this.options.placeholderClass;
          return $("." + placeholder_class).remove();
        }
      };

      Plugin.prototype.enableResize = function() {
        var animation_speed, binding, resizing,
          _this = this;
        animation_speed = this.options.animationSpeed;
        resizing = false;
        binding = "resize." + this.identifier;
        return $(window).on(binding, function() {
          if (!resizing) {
            resizing = true;
            setTimeout((function() {
              return _this.render();
            }), animation_speed / 3);
            setTimeout((function() {
              return _this.render();
            }), animation_speed / 3);
            return setTimeout(function() {
              resizing = false;
              return _this.render();
            }, animation_speed / 3);
          }
        });
      };

      Plugin.prototype.shuffle = function() {
        var calculateShuffled;
        calculateShuffled = function(container, activeClass) {
          var shuffle;
          shuffle = function(arr) {
            var i, j, x;
            j = void 0;
            x = void 0;
            i = arr.length;
            while (i) {
              j = parseInt(Math.random() * i);
              x = arr[--i];
              arr[i] = arr[j];
              arr[j] = x;
            }
            return arr;
          };
          return container.each(function() {
            var items;
            items = container.find("." + activeClass).filter(":visible");
            if (items.length) {
              return container.html(shuffle(items));
            } else {
              return this;
            }
          });
        };
        if (!this.globals.dragging) {
          calculateShuffled(this.$container, this.options.activeClass);
          this.enableFeatures();
          return this.$container.trigger("ss-rearrange");
        }
      };

      Plugin.prototype.lowestCol = function(array, offset) {
        var augmented_array, i, length, _i;
        if (offset == null) {
          offset = 0;
        }
        length = array.length;
        augmented_array = [];
        for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
          augmented_array.push([array[i], i]);
        }
        augmented_array.sort(function(a, b) {
          var ret;
          ret = a[0] - b[0];
          if (ret === 0) {
            ret = a[1] - b[1];
          }
          return ret;
        });
        return augmented_array[offset][1];
      };

      Plugin.prototype.highestCol = function(array) {
        return $.inArray(Math.max.apply(window, array), array);
      };

      Plugin.prototype.destroy = function() {
        var $active_children, $container, active_class;
        $container = this.$container;
        $container.off("ss-arrange");
        $container.off("ss-rearrange");
        $container.off("ss-setTargetPosition");
        $container.off("ss-destroy");
        active_class = this.options.activeClass;
        $active_children = $container.find("." + active_class);
        if (this.options.enableDrag) {
          $active_children.draggable('destroy');
        }
        if (this.options.enableCrossDrop) {
          $container.droppable('destroy');
        }
        $active_children.removeClass(active_class);
        return $container.removeClass(this.identifier);
      };

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        var bound_indentifier, old_class, _ref, _ref1;
        old_class = (_ref = $(this).attr("class")) != null ? (_ref1 = _ref.match(/shapeshifted_container_\w+/)) != null ? _ref1[0] : void 0 : void 0;
        if (old_class) {
          bound_indentifier = "resize." + old_class;
          $(window).off(bound_indentifier);
          $(this).removeClass(old_class);
        }
        return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      });
    };
  })(jQuery, window, document);

}).call(this);
