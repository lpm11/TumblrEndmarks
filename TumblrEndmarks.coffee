###
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
###

insertionText = (_t) ->
  t = new Date(_t * 1000);
  return '<li class="notification single_notification alt"><div class="notification_inner clearfix"><div class="notification_sentence"><div class="hide_overflow">↑ここまで読んだ: ' + "#{t.getFullYear()}/#{t.getMonth()}/#{t.getDay()} #{t.getHours()}:#{t.getMinutes()}:#{t.getSeconds()}" + '</div></div></div></li>';

endmarks = JSON.parse(localStorage.getItem("TumblrEndmarks-endmarks"));
console.log("TumblrEndmarks: #{if endmarks? then endmarks.length else 0} record[s] found.");
console.dir(endmarks);

post_ids = [];

if (endmarks?)
  # Current shown posts
  $("#posts .post[data-post-id]").each ->
    for e in endmarks
      post_ids.push($(this).attr("data-post-id"));
      if ($(this).attr("data-post-id")==e["post_id"])
        console.log("TumblrEndmarks: found endmark: #{e['post_id']}");
        $(this).parent("li").after(insertionText(e["created_at"]));
    return;
else
  endmarks = [];

# Future shown posts
mo = new MutationObserver((mutationRecords) ->
  for record in mutationRecords
    if (record.addedNodes?)
      for post_container in record.addedNodes
        $(post_container).find(".post[data-post-id]").each ->
          post_ids.push($(this).attr("data-post-id"));
  return;
);
mo.observe($("#posts").get(0), { childList: true });

$(window).scroll(() ->
  window_bottom = $(window).scrollTop() + $(window).height();
  inside_ids = [];
  outside_ids = [];

  for post_id in post_ids
    post = $("#post_#{post_id}");
    if (post.offset?()?)
      post_bottom = post.offset().top + post.height();
      if (post_bottom < window_bottom)
        inside_ids.push(post_id);
        continue;
    outside_ids.push(post_id);

  for post_id in inside_ids
    post = $("#post_#{post_id}");
    x = { "post_id": post_id, "created_at": new Date()/1000|0 };
    if (post_id > endmarks[0]?["post_id"])
      endmarks.unshift(x);
      endmarks.pop() if (endmarks.length > 3);
      console.log("TumblrEndmarks: New endmark placed.");
    else if (post_id > endmarks[1]?["post_id"])
      endmarks[0] = x;
      console.log("TumblrEndmarks: Endmark incremented.");
    else if (post_id < endmarks[1]?["post_id"])
      endmarks.shift();
      endmarks[0] = x;
      console.log("TumblrEndmarks: Endmark shifted.");
    else

    localStorage.setItem("TumblrEndmarks-endmarks", JSON.stringify(endmarks));
    console.log("TumblrEndmarks: #{post_id} is inside of window");

  post_ids = outside_ids;
)
