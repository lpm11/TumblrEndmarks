// Generated by CoffeeScript 1.8.0

/*
// ==UserScript==
// @id             lpm11/TumblrEndmarks
// @name           TumblrEndmarks
// @description    Add endmarks to tumblr dashboard
// @include        http://www.tumblr.com/dashboard
// @include        https://www.tumblr.com/dashboard
// @require        http://code.jquery.com/jquery-latest.js
// @version        0.1
// @grant          none
// ==/UserScript==
 */

(function() {
  var endmarks, insertionText, mo, post_ids;

  insertionText = function(_t) {
    var t;
    t = new Date(_t * 1000);
    return '<li class="notification single_notification alt"><div class="notification_inner clearfix"><div class="notification_sentence"><div class="hide_overflow">↑ここまで読んだ: ' + ("" + (t.getFullYear()) + "/" + (t.getMonth()) + "/" + (t.getDay()) + " " + (t.getHours()) + ":" + (t.getMinutes()) + ":" + (t.getSeconds())) + '</div></div></div></li>';
  };

  endmarks = JSON.parse(localStorage.getItem("TumblrEndmarks-endmarks"));

  console.log("TumblrEndmarks: " + (endmarks != null ? endmarks.length : 0) + " record[s] found.");

  console.dir(endmarks);

  post_ids = [];

  if ((endmarks != null)) {
    $("#posts .post[data-post-id]").each(function() {
      var e, _i, _len;
      for (_i = 0, _len = endmarks.length; _i < _len; _i++) {
        e = endmarks[_i];
        post_ids.push($(this).attr("data-post-id"));
        if ($(this).attr("data-post-id") === e["post_id"]) {
          console.log("TumblrEndmarks: found endmark: " + e['post_id']);
          $(this).parent("li").after(insertionText(e["created_at"]));
        }
      }
    });
  } else {
    endmarks = [];
  }

  mo = new MutationObserver(function(mutationRecords) {
    var post_container, record, _i, _j, _len, _len1, _ref;
    for (_i = 0, _len = mutationRecords.length; _i < _len; _i++) {
      record = mutationRecords[_i];
      if ((record.addedNodes != null)) {
        _ref = record.addedNodes;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          post_container = _ref[_j];
          $(post_container).find(".post[data-post-id]").each(function() {
            return post_ids.push($(this).attr("data-post-id"));
          });
        }
      }
    }
  });

  mo.observe($("#posts").get(0), {
    childList: true
  });

  $(window).scroll(function() {
    var inside_ids, outside_ids, post, post_bottom, post_id, window_bottom, x, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    window_bottom = $(window).scrollTop() + $(window).height();
    inside_ids = [];
    outside_ids = [];
    for (_i = 0, _len = post_ids.length; _i < _len; _i++) {
      post_id = post_ids[_i];
      post = $("#post_" + post_id);
      if (((typeof post.offset === "function" ? post.offset() : void 0) != null)) {
        post_bottom = post.offset().top + post.height();
        if (post_bottom < window_bottom) {
          inside_ids.push(post_id);
          continue;
        }
      }
      outside_ids.push(post_id);
    }
    for (_j = 0, _len1 = inside_ids.length; _j < _len1; _j++) {
      post_id = inside_ids[_j];
      post = $("#post_" + post_id);
      x = {
        "post_id": post_id,
        "created_at": new Date() / 1000 | 0
      };
      if (post_id > ((_ref = endmarks[0]) != null ? _ref["post_id"] : void 0)) {
        endmarks.unshift(x);
        if (endmarks.length > 3) {
          endmarks.pop();
        }
        console.log("TumblrEndmarks: New endmark placed.");
      } else if (post_id > ((_ref1 = endmarks[1]) != null ? _ref1["post_id"] : void 0)) {
        endmarks[0] = x;
        console.log("TumblrEndmarks: Endmark incremented.");
      } else if (post_id < ((_ref2 = endmarks[1]) != null ? _ref2["post_id"] : void 0)) {
        endmarks.shift();
        endmarks[0] = x;
        console.log("TumblrEndmarks: Endmark shifted.");
      } else {

      }
      localStorage.setItem("TumblrEndmarks-endmarks", JSON.stringify(endmarks));
      console.log("TumblrEndmarks: " + post_id + " is inside of window");
    }
    return post_ids = outside_ids;
  });

}).call(this);
