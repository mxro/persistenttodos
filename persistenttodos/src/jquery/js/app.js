/*global jQuery, Handlebars */
jQuery(function ($) {
	'use strict';

	var Utils = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			this.ENTER_KEY = 13;
			this.urlStatus = 'Status :';
			this.loadUrl = 'No todo list Url loaded/saved';
			this.todos = Utils.store('todos-jquery');
			this.cacheElements();
			this.bindEvents();
			this.render();
		},
		cacheElements: function () {
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.nextfooterTemplate = Handlebars.compile($('#nextfooter-template').html());
			this.$todoApp = $('#todoapp');
			this.$newTodo = $('#new-todo');
			this.$toggleAll = $('#toggle-all');
			this.$main = $('#main');
			this.$todoList = $('#todo-list');
			this.$footer = this.$todoApp.find('#footer');
			this.$count = $('#todo-count');
			this.$clearBtn = $('#clear-completed');
			this.$loadBtn = $('#load-btn');
			this.$saveBtn = $('#save-btn');
			this.$nextWeb = $('#nextweb');
			this.$nextfooter = this.$nextWeb.find('#nextfooter');
			this.$statusLabel = $('#statuslabel');
			this.$saveUrlStatus = $('saved-url');
		},
		bindEvents: function () {
			var list = this.$todoList;
			this.$newTodo.on('keyup', this.create);
			this.$toggleAll.on('change', this.toggleAll);
			this.$footer.on('click', '#clear-completed', this.destroyCompleted);
			//this.$nextWeb.on('click', '#load-btn', this.onSave);
			this.$loadBtn.click(this.onLoad);
			this.$saveBtn.click(this.onSave);
			list.on('change', '.toggle', this.toggle);
			list.on('dblclick', 'label', this.edit);
			list.on('keypress', '.edit', this.blurOnEnter);
			list.on('blur', '.edit', this.update);
			list.on('click', '.destroy', this.destroy);
		},
		render: function () {
			this.$todoList.html(this.todoTemplate(this.todos));
			this.$main.toggle(!!this.todos.length);
			this.$toggleAll.prop('checked', !this.activeTodoCount());
			this.renderFooter();
			this.renderNextFooter(this.urlStatus,this.loadUrl);
			Utils.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.activeTodoCount();
			var footer = {
				activeTodoCount: activeTodoCount,
				activeTodoWord: Utils.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount
			};

			this.$footer.toggle(!!todoCount);
			this.$footer.html(this.footerTemplate(footer));
		},
		renderNextFooter: function (urlStatus,loadUrl) {
	
			var nextfooter = {
				status: urlStatus,
				savedUrl: loadUrl
			};
			this.$nextfooter.toggle(!!urlStatus);
			this.$nextfooter.html(this.nextfooterTemplate(nextfooter));
		},
		onLoad: function(e){
			
			this.urlSaved = 'Loaded Url: ';
			this.loadUrl = 'http:w';
			document.all('statuslabel').innerHTML = this.urlSaved+this.loadUrl;
			App.render();
			alert(this.urlSaved + this.loadUrl);
			},
		onSave: function(e){
			
			this.urlSaved = 'Saved Url: ';
			this.loadUrl = 'http://sw';
			document.all('statuslabel').innerHTML = this.urlSaved+this.loadUrl;
			App.render();
			alert(this.urlSaved + this.loadUrl);
			},	
			
		toggleAll: function () {
			var isChecked = $(this).prop('checked');

			$.each(App.todos, function (i, val) {
				val.completed = isChecked;
			});

			App.render();
		},
		activeTodoCount: function () {
			var count = 0;

			$.each(this.todos, function (i, val) {
				if (!val.completed) {
					count++;
				}
			});

			return count;
		},

		destroyCompleted: function () {
			var todos = App.todos;
			var l = todos.length;

			while (l--) {
				if (todos[l].completed) {
					todos.splice(l, 1);
				}
			}

			App.render();
		},
		

		// accepts an element from inside the `.item` div and
		// returns the corresponding todo in the todos array
		getTodo: function (elem, callback) {
			var id = $(elem).closest('li').data('id');

			$.each(this.todos, function (i, val) {
				if (val.id === id) {
					callback.apply(App, arguments);
					return false;
				}
			});
		},
		create: function (e) {
			var $input = $(this);
			var val = $.trim($input.val());

			if (e.which !== App.ENTER_KEY || !val) {
				return;
			}

			App.todos.push({
				id: Utils.uuid(),
				title: val,
				completed: false
			});

			$input.val('');
			App.render();
		},
		toggle: function () {
			App.getTodo(this, function (i, val) {
				val.completed = !val.completed;
			});
			App.render();
		},
		edit: function () {
			$(this).closest('li').addClass('editing').find('.edit').focus();
		},
		blurOnEnter: function (e) {
			if (e.which === App.ENTER_KEY) {
				e.target.blur();
			}
		},
		update: function () {
			var val = $.trim($(this).removeClass('editing').val());

			App.getTodo(this, function (i) {
				if (val) {
					this.todos[i].title = val;
				} else {
					this.todos.splice(i, 1);
				}
				this.render();
			});
		},
		destroy: function () {
			App.getTodo(this, function (i) {
				this.todos.splice(i, 1);
				this.render();
			});
		}
	};

	App.init();
});
