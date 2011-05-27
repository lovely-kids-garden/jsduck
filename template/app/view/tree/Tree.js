/**
 * The class tree
 */
Ext.define('Docs.view.tree.Tree', {
    extend: 'Ext.tree.Panel',
    alias : 'widget.classtree',
    requires: [
        'Docs.view.HoverMenuButton',
        'Docs.Favorites',
        'Docs.History'
    ],

    id: 'treePanelCmp',
    cls: 'iScroll',
    folderSort: true,
    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when class in tree was clicked on and needs to be loaded.
             * @param {String} cls  name of the class.
             */
            "classclick"
        );

        // Expand the main tree
        this.root.expanded = true;
        this.root.children[0].expanded = true;
        // Add links for favoriting classes
        // HACK: To do the favicons initialization after History store loaded.
        this.on("render", function() {
            Ext.getStore("Favorites").on("load", function() {
                this.getRootNode().cascadeBy(this.addFavIcons, this);
            }, this);
        }, this);

        this.on("itemclick", this.onItemClick, this);

        this.dockedItems = [
            {
                xtype: 'container',
                layout: 'hbox',
                dock: 'top',
                margin: '0 0 15 0',
                items: [
                    {
                        xtype: 'hovermenubutton',
                        cls: 'icon-fav sidebar',
                        text: 'Favorites',
                        menuCfg: {
                            cls: 'sidebar',
                            emptyText: 'No favorites',
                            showCloseButtons: true
                        },
                        store: Ext.getStore('Favorites'),
                        listeners: {
                            closeclick: function(cls) {
                                Docs.Favorites.remove(cls);
                            }
                        }
                    },
                    {
                        xtype: 'hovermenubutton',
                        cls: 'icon-hist sidebar',
                        text: 'History',
                        menuCfg: {
                            cls: 'sidebar',
                            emptyText: 'No history',
                            showCloseButtons: true
                        },
                        store: Ext.getStore('History'),
                        listeners: {
                            closeclick: function(cls) {
                                Docs.History.removeClass(cls);
                            }
                        }
                    }
                ]
            }
        ];

        this.callParent();
    },

    addFavIcons: function(node) {
        if (node.get("leaf")) {
            var cls = node.raw.clsName;
            var show = Docs.Favorites.has(cls) ? "show" : "";
            node.set("text", node.get("text") + Ext.String.format('<a rel="{0}" class="fav {1}"></a>', cls, show));
            node.commit();
        }
    },

    onItemClick: function(view, node, item, index, e) {
        var clsName = node.raw ? node.raw.clsName : node.data.clsName;

        if (clsName) {
            if (e.getTarget(".fav")) {
                var favEl = Ext.get(e.getTarget(".fav"));
                if (favEl.hasCls('show')) {
                    Docs.Favorites.remove(clsName);
                }
                else {
                    Docs.Favorites.add(clsName);
                }
            }
            else {
                this.fireEvent("classclick", clsName);
            }
        }
        else if (!node.isLeaf()) {
            if (node.isExpanded()) {
                node.collapse(false);
            }
            else {
                node.expand(false);
            }
        }
    },

    /**
     * Selects class node in tree by name.
     *
     * @param {String} cls
     */
    selectClass: function(cls) {
        var r = this.findRecordByClassName(cls);
        if (r) {
            this.getSelectionModel().select(r);
            r.bubble(function(n) {
                n.expand();
            });
        }
    },

    /**
     * Sets favorite status of class on or off.
     *
     * @param {String} cls  name of the class
     * @param {Boolean} enable  true to mark class as favorite.
     */
    setFavorite: function(cls, enable) {
        var r = this.findRecordByClassName(cls);
        if (r) {
            var el = this.getView().getNode(r);
            Ext.get(el).down(".fav")[enable ? "addCls" : "removeCls"]("show");
        }
    },

    findRecordByClassName: function(cls) {
        return this.getRootNode().findChildBy(function(n) {
            return cls === n.raw.clsName;
        }, this, true);
    }
});
