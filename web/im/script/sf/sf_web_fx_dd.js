starfish.web.fx.dd = {
	obj: null,

	init: function(o, oRoot, bound, coor, mapper, dragfunc) {
        var web = starfish.web;
        starfish.web.event.addEvent(o, 'mousedown', web.fx.dd.start);

        o.hmode = coor && coor.horz ? false : true;
		o.vmode = coor && coor.vert ? false : true;

		o.root = oRoot && oRoot != null ? oRoot : o;

        if (o.hmode && isNaN(parseInt(o.root.style.left))) {
            web.css(o.root, 'left', web.window.pageX(o.root) + 'px');
			//o.root.style.left = "0px";
		}
		if (o.vmode && isNaN(parseInt(o.root.style.top))) {
            web.css(o.root, 'top', web.window.pageY(o.root) + 'px');
			//o.root.style.top = "0px";
		}
		if (!o.hmode && isNaN(parseInt(o.root.style.right))) {
            web.css(o.root, 'right', web.window.pageX(o.root) + web.window.getWidth(o.root) + 'px');
			//o.root.style.right = "0px";
		}
		if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) {
            web.css(o.root, 'bottom', web.window.pageY(o.root) + web.window.getHeight(o.root) + 'px');
			//o.root.style.bottom = "0px";
		}

		o.minX = bound && bound.minX || null;
		o.minY = bound && bound.minY || null;
		o.maxX = bound && bound.maxX || null;
		o.maxY = bound && bound.maxY || null;

		o.xMapper = mapper && mapper.x || null;
		o.yMapper = mapper && mapper.y || null;

		o.root.ondragstart = dragfunc && dragfunc.dragstart || new Function();
        o.root.ondrag = dragfunc && dragfunc.dragging || new Function();
		o.root.ondragend = dragfunc && dragfunc.dragend || new Function();
	},

	start: function(e) {
		var o = starfish.web.fx.dd.obj = this;
		
		e = starfish.web.fx.dd.fixE(e);
		
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right);
		var y = parseInt(o.vmode ? o.root.style.top : o.root.style.bottom);
		
		o.root.ondragstart(x, y);

		o.lastMouseX = e.clientX;
		o.lastMouseY = e.clientY;

		if (o.hmode) {
			if (o.minX != null) {
				o.minMouseX = e.clientX - x + o.minX;
			}	
			if (o.maxX != null) {
				o.maxMouseX = o.minMouseX + o.maxX - o.minX;
			}	
		} else {
			if (o.minX != null) {
				o.maxMouseX = -o.minX + e.clientX + x;
			}	
			if (o.maxX != null) {
				o.minMouseX = -o.maxX + e.clientX + x;
			}	
		}

		if (o.vmode) {
			if (o.minY != null) {
				o.minMouseY = e.clientY - y + o.minY;
			}	
			if (o.maxY != null) {
				o.maxMouseY = o.minMouseY + o.maxY - o.minY;
			}	
		} else {
			if (o.minY != null) {
				o.maxMouseY = -o.minY + e.clientY + y;
			}	
			if (o.maxY != null) {
				o.minMouseY = -o.maxY + e.clientY + y;
			}	
		}

        starfish.web.event.addEvent(document, 'mousemove', starfish.web.fx.dd.drag);
        starfish.web.event.addEvent(document, 'mouseup', starfish.web.fx.dd.end);

		return false;
	},

	drag: function(e) {
		e = starfish.web.fx.dd.fixE(e);
		var o = starfish.web.fx.dd.obj;

		var ex = e.clientX;
		var ey = e.clientY;
		
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right);
		var y = parseInt(o.vmode ? o.root.style.top : o.root.style.bottom);
		var nx, ny;

		if (o.minX != null) {
			ex = o.hmode ? Math.max(ex, o.minMouseX) : Math
					.min(ex, o.maxMouseX);
		}	
		if (o.maxX != null) {
			ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math
					.max(ex, o.minMouseX);
		}	
		if (o.minY != null) {
			ey = o.vmode ? Math.max(ey, o.minMouseY) : Math
					.min(ey, o.maxMouseY);
		}	
		if (o.maxY != null) {
			ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math
					.max(ey, o.minMouseY);
		}
		
		nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
		ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

		if (o.xMapper) {
			nx = o.xMapper(y);
		} else if (o.yMapper) {
			ny = o.yMapper(x);
		}
		
		o.root.style[o.hmode ? "left" : "right"] = nx + "px";
		o.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
		
		o.lastMouseX = ex;
		o.lastMouseY = ey;

		o.root.ondrag(nx, ny);
		return false;
	},

	end: function(e) {
		var dd = starfish.web.fx.dd;

        starfish.web.event.removeEvent(document, 'mousemove', starfish.web.fx.dd.drag);
        starfish.web.event.removeEvent(document, 'mouseup', starfish.web.fx.dd.end);

		dd.obj.root.ondragend(parseInt(dd.obj.root.style[dd.obj.hmode ? "left"
				: "right"]), parseInt(dd.obj.root.style[dd.obj.vmode ? "top"
				: "bottom"]));
		dd.obj = null;
	},

	fixE: function(e) {
		if (typeof e == 'undefined') { // IE
			e = window.event;
		}	
		if (typeof e.layerX == 'undefined') {
			e.layerX = e.offsetX;
		}	
		if (typeof e.layerY == 'undefined') {
			e.layerY = e.offsetY;
		}	
		return e;
	}
	
};
