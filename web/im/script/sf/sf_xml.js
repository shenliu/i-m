/**
 * 解析XML
 * 
 * @namespace org.shen.Starfish
 * @module xml
 */
starfish.xml = {
    /**
     * 创建一个新的Document文档对象.
     *      如果没有传入参数,则文档为空文档.
     *      如果传入root tag,则文档包含根元素.
     *      如果传入namespace,则文档包含命名空间
     * @param {String}  rootTagName  根元素(可选)
     * @param {String}  namespaceURL 命名空间(可选)
     * @return {Document}  XMLDocument
     */
    newDocument: function(rootTagName, namespaceURL) {
        if (!rootTagName) {
            rootTagName = "";
        }

        if (!namespaceURL) {
            namespaceURL = "";
        }

        if (document.implementation && document.implementation.createDocument) {
            return document.implementation.createDocument(namespaceURL,
                    rootTagName, null);
        } else { // ie
            var doc = new ActiveXObject("MSXML2.DOMDocument");
            if (rootTagName) {
                var prefix = "";
                var tagname = rootTagName;
                var p = rootTagName.indexOf(':');
                if (p != -1) {
                    prefix = rootTagName.substring(0, p);
                    tagname = rootTagName.substring(p + 1);
                }

                if (namespaceURL) {
                    if (!prefix) {
                        prefix = "a0";
                    }
                } else {
                    prefix = "";
                }

                var text = "<" + (prefix ? (prefix + ":") : "") + tagname +
                        (namespaceURL
                                ? (" xmlns:" + prefix + '="' + namespaceURL + '"')
                                : "") +
                        "/>";
                doc.loadXML(text);
            }
            return doc;
        }
    },

    /**
     * 同步载入给定url的xml文件
     * @param {String}  url  指定xml文件的url
     * @return {Document}  XMLDocument
     */
    load: function(url) {
        var xmldoc = starfish.xml.newDocument();
        xmldoc.async = false;  // 同步
        if (window.XMLHttpRequest) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", url, false);
            xmlhttp.send(null);
            xmldoc = xmlhttp.responseXML;
        } else {  // ie
            xmldoc.load(url);
        }
        return xmldoc;
    },

    /**
     * 异步载入给定url的xml文件.
     * 当创建Document完毕,执行给定的callback方法,最后载入xml文件
     * @param {String}  url  指定xml文件的url
     * @param {Function}  callback  要执行的回调函数
     */
    loadAsync: function(url, callback) {
        var xmldoc = starfish.xml.newDocument();

        if (document.implementation && document.implementation.createDocument) {
            xmldoc.onload = function() {
                callback(xmldoc);
            };
        } else {
            xmldoc.onreadystatechange = function() {
                if (xmldoc.readyState == 4) {
                    callback(xmldoc);
                }
            };
        }
        xmldoc.load(url);
    },

    /**
     * 解析给定的字符串形式的xml,返回它的对象
     * @param {String}  text  字符串形式的xml
     * @return {Document}  XMLDocument
     */
    parse: function(text) {
        if (typeof DOMParser != "undefined") {
            return (new DOMParser()).parseFromString(text, "application/xml");
        } else if (typeof ActiveXObject != "undefined") {
            var doc = starfish.xml.newDocument();
            doc.loadXML(text);
            return doc;
        } else { // Safari
            var url = "data:text/xml;charset=utf-8," + encodeURIComponent(text);
            var request = new XMLHttpRequest();
            request.open("GET", url, false);
            request.send(null);
            return request.responseXML;
        }
    },

    /**
     * 通过给定id值找到文档中的 &lt;xml&gt;.
     * 如果&lt;xml&gt;中包含src属性,则得到src指定的url中的文档
     * @param {String}  id  id值
     * @return {Document}  XMLDocument
     */
    getDataIsland: function(id) {
        var doc;

        doc = starfish.xml.getDataIsland.cache[id];
        // 已缓存 直接返回
        if (doc) {
            return doc;
        }

        doc = document.getElementById(id);
        // 如果有src属性,则通过src属性载入Document
        var url = doc.getAttribute('src');
        if (url) {
            doc = starfish.xml.load(url);
        } else if (!doc.documentElement) {
            var docelt = doc.firstChild;
            while (docelt != null) {
                if (docelt.nodeType == 1) { // Node.ELEMENT_NODE
                    break;
                }
                docelt = docelt.nextSibling;
            }
            doc = starfish.xml.newDocument();

            if (docelt) {
                doc.appendChild(doc.importNode(docelt, true));
            }
        }
        starfish.xml.getDataIsland.cache[id] = doc;
        return doc;
    },

    /**
     * This XML.Transformer class encapsulates an XSL stylesheet.
     * If the stylesheet parameter is a URL, we load it.
     * Otherwise, we assume it is an appropriate DOM Document
     */
    transformer: function(stylesheet) {
        if (typeof stylesheet == "string") {
            stylesheet = starfish.xml.load(stylesheet);
        }
        this.stylesheet = stylesheet;

        // In Mozilla-based browsers, create an XSLTProcessor object and
        // tell it about the stylesheet.
        if (typeof XSLTProcessor != "undefined") {
            this.processor = new XSLTProcessor();
            this.processor.importStylesheet(this.stylesheet);
        }
    },

    /**
     * This is an XSLT utility function that is useful when a stylesheet is
     * used only once.
     */
    transform: function(xmldoc, stylesheet, element) {
        var transformer = new starfish.xml.Transformer(stylesheet);
        transformer.transform(xmldoc, element);
    },

    /**
     * XML.XPathExpression is a class that encapsulates an XPath query and its
     * associated namespace prefix-to-URL mapping.  Once an XML.XPathExpression
     * object has been created, it can be evaluated one or more times (in one
     * or more contexts) using the getNode() or getNodes() methods.
     *
     * The first argument to this constructor is the text of the XPath expression.
     *
     * If the expression includes any XML namespaces, the second argument must
     * be a JavaScript object that maps namespace prefixes to the URLs that define
     * those namespaces.  The properties of this object are the prefixes, and
     * the values of those properties are the URLs.
     */
    XPathExpression: function(xpathText, namespaces) {
        this.xpathText = xpathText;    // Save the text of the expression
        this.namespaces = namespaces;  // And the namespace mapping

        if (document.createExpression) {
            // If we're in a W3C-compliant browser, use the W3C API
            // to compile the text of the XPath query
            this.xpathExpr =
                    document.createExpression(xpathText, function(prefix) {
                        return namespaces[prefix];
                    });
        } else {
            // Otherwise, we assume for now that we're in IE and convert the
            // namespaces object into the textual form that IE requires.
            this.namespaceString = "";
            if (namespaces != null) {
                for (var prefix in namespaces) {
                    // Add a space if there is already something there
                    if (this.namespaceString) this.namespaceString += ' ';
                    // And add the namespace
                    this.namespaceString += 'xmlns:' + prefix + '="' +
                            namespaces[prefix] + '"';
                }
            }
        }
    },

    // A utility to create an XML.XPathExpression and call getNodes() on it
    getNodes: function(context, xpathExpr, namespaces) {
        return (new starfish.xml.XPathExpression(xpathExpr, namespaces)).getNodes(context, xpathExpr);
    },

    // A utility to create an XML.XPathExpression and call getNode() on it
    getNode: function(context, xpathExpr, namespaces) {
        return (new starfish.xml.XPathExpression(xpathExpr, namespaces)).getNode(context, xpathExpr);
    },

    /**
     * Serialize an XML Document or Element and return it as a string.
     */
    serialize: function(node) {
        if (typeof XMLSerializer != "undefined") {
            return (new XMLSerializer()).serializeToString(node);
        } else if (node.xml) {
            return node.xml;
        } else {
            throw "XML.serialize is not supported or can't serialize " + node;
        }
    },

    /*
     * Expand any templates at or beneath element e.
     * If any of the templates use XPath expressions with namespaces, pass
     * a prefix-to-URL mapping as the second argument as with XML.XPathExpression()
     *
     * If e is not supplied, document.body is used instead.  A common
     * use case is to call this function with no arguments in response to an
     * onload event handler.  This automatically expands all templates.
     */
    expandTemplates: function(e, namespaces) {
        e = e || document.body;
        e = $(e);
        
        if (!namespaces) {
            namespaces = null;
        }

        // An HTML element is a template if it has a "datasource" attribute.
        // Recursively find and expand all templates.  Note that we don't
        // allow templates within templates.
        if (e.getAttribute("datasource")) {
            // If it is a template, expand it.
            starfish.xml.expandTemplate(e, namespaces);
        } else {
            // Otherwise, recurse on each of the children.  We make a static
            // copy of the children first so that expanding a template doesn't
            // mess up our iteration.
            var kids = []; // To hold copy of child elements
            for(var i = 0; i < e.childNodes.length; i++) {
                var c = e.childNodes[i];
                if (c.nodeType == 1) {
                    kids.push(e.childNodes[i]);
                }
            }

            // Now recurse on each child element
            for(i = 0; i < kids.length; i++) {
                starfish.xml.expandTemplates(kids[i], namespaces);
            }
        }
    },

    /**
     * Expand a single specified template.
     * If the XPath expressions in the template use namespaces, the second
     * argument must specify a prefix-to-URL mapping
     */
    expandTemplate: function(template, namespaces) {
        template = $(template);
        if (!namespaces) {
            namespaces = null;
        }

        // The first thing we need to know about a template is where the
        // data comes from.
        var datasource = template.getAttribute("datasource");

        // If the datasource attribute begins with '#', it is the name of
        // an XML data island.  Otherwise, it is the URL of an external XML file
        var datadoc;
        if (datasource.charAt(0) == '#') {   // Get data island
            datadoc = starfish.xml.getDataIsland(datasource.substring(1));
        } else {                               // Or load external document
            datadoc = starfish.xml.load(datasource);
        }

        // Now figure out which nodes in the datasource will be used to
        // provide the data.  If the template has a foreach attribute,
        // we use it as an XPath expression to get a list of nodes.  Otherwise
        // we use all child elements of the document element
        var datanodes;
        var foreach = template.getAttribute("foreach");
        if (foreach) {
            datanodes = starfish.xml.getNodes(datadoc, foreach, namespaces);
        } else {
            // If there is no "foreach" attribute, use the element
            // children of the documentElement
            datanodes = [];
            for (var c = datadoc.documentElement.firstChild; c != null; c = c.nextSibling) {
                if (c.nodeType == 1) {
                    datanodes.push(c);
                }
            }
        }

        // Remove the template element from its parent,
        // but remember the parent, and also the nextSibling of the template.
        var container = template.parentNode;
        var insertionPoint = template.nextSibling;
        template = container.removeChild(template);

        // For each element of the datanodes array, we'll insert a copy of
        // the template back into the container.  Before doing this, though, we
        // expand any child in the copy that has a "data" attribute.
        for (var i = 0; i < datanodes.length; i++) {
            var copy = template.cloneNode(true);           // Copy template
            expand(copy, datanodes[i], namespaces);        // Expand copy
            container.insertBefore(copy, insertionPoint);  // Insert copy
        }

        // This nested function finds any child elements of e that have a data
        // attribute.  It treats that attribute as an XPath expression and
        // evaluates it in the context of datanode.  It takes the text value of
        // the XPath result and makes it the content of the HTML node being
        // expanded.  All other content is deleted
        function expand(e, datanode, namespaces) {
            for (var c = e.firstChild; c != null; c = c.nextSibling) {
                if (c.nodeType != 1) {
                    continue;
                }
                var dataexpr = c.getAttribute("data");
                if (dataexpr) {
                    // Evaluate XPath expression in context
                    var n = starfish.xml.getNode(datanode, dataexpr, namespaces);
                    // Delete any content of the element
                    c.innerHTML = "";
                    // And insert the text content of the XPath result
                    c.appendChild(document.createTextNode(getText(n)));
                } else { // If we don't expand the element, recurse on it.
                    expand(c, datanode, namespaces);
                }
            }
        }

        // This nested function extracts the text from a DOM node, recursing
        // if necessary
        function getText(n) {
            switch (n.nodeType) {
                case 1: /* element */
                    var s = "";
                    for (var c = n.firstChild; c != null; c = c.nextSibling) {
                        s += getText(c);
                    }
                    return s;
                case 2: /* attribute*/
                case 3: /* text */
                case 4: /* cdata */
                    return n.nodeValue;
                default:
                    return "";
            }
        }

    }

};

starfish.xml.getDataIsland.cache = {};

/**
 * This is the transform() method of the XML.Transformer class.
 * It transforms the specified xml node using the encapsulated stylesheet.
 * The results of the transformation are assumed to be HTML and are used to
 * replace the content of the specified element
 */
starfish.xml.transformer.prototype.transform = function(node, element) {
    element = $(element);

    if (this.processor) {
        // If we've created an XSLTProcessor (i.e. we're in Mozilla) use it.
        // Transform the node into a DOM DocumentFragment
        var fragment = this.processor.transformToFragment(node, document);
        // Erase the existing content of element
        element.innerHTML = "";
        // And insert the transformed nodes
        element.appendChild(fragment);
    } else if ("transformNode" in node) {
        // If the node has a transformNode() function (in IE), use that.
        // Note that transformNode() returns a string.
        element.innerHTML = node.transformNode(this.stylesheet);
    } else {
        // Otherwise, we're out of luck
        throw "XSLT is not supported in this browser";
    }
};

/**
 * This is the getNodes() method of XML.XPathExpression.  It evaluates the
 * XPath expression in the specified context.  The context argument should
 * be a Document or Element object.  The return value is an array
 * or array-like object containing the nodes that match the expression.
 */
starfish.xml.XPathExpression.prototype.getNodes = function(context, xpathExpr) {
    if (this.xpathExpr) {
        // If we are in a W3C-compliant browser, we compiled the
        // expression in the constructor.  We now evaluate that compiled
        // expression in the specified context
        var xPathEvalute = new XPathEvaluator();
        var result = xPathEvalute.evaluate(xpathExpr, context, null,
                XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        // Copy the results we get into an array.
        var aNodes = [];
        if (result != null) {
            var oElement = result.iterateNext();
            while (oElement) {
                aNodes.push(oElement);
                oElement = result.iterateNext();
            }
        }
        return aNodes;
    } else {
        try {
            // We need the Document object to specify namespaces
            var doc = context.ownerDocument;
            // If the context doesn't have ownerDocument, it is the Document
            if (doc == null) {
                doc = context;
            }
            // This is IE-specific magic to specify prefix-to-URL mapping
            doc.setProperty("SelectionLanguage", "XPath");
            doc.setProperty("SelectionNamespaces", this.namespaceString);
            // In IE, the context must be an Element not a Document,
            // so if context is a document, use documentElement instead
            if (context == doc) {
                context = doc.documentElement;
            }
            // Now use the IE method selectNodes() to evaluate the expression
            return context.selectNodes(this.xpathText);
        } catch(e) {
            throw e.message + " XPath not supported by this browser.";
        }
    }
};

/**
 * This is the getNode() method of XML.XPathExpression.  It evaluates the
 * XPath expression in the specified context and returns a single matching
 * node (or null if no node matches).  If more than one node matches,
 * this method returns the first one in the document.
 * The implementation differs from getNodes() only in the return type.
 */
starfish.xml.XPathExpression.prototype.getNode = function(context, xpathExpr) {
    if (this.xpathExpr) {
        var xPathEvalute = new XPathEvaluator();
        var result = xPathEvalute.evaluate(xpathExpr, context, null,
                XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    } else {
        try {
            var doc = context.ownerDocument;
            if (doc == null) doc = context;
            doc.setProperty("SelectionLanguage", "XPath");
            doc.setProperty("SelectionNamespaces", this.namespaceString);
            if (context == doc) context = doc.documentElement;
            // In IE call selectSingleNode instead of selectNodes
            return context.selectSingleNode(this.xpathText);
        } catch(e) {
            throw "XPath not supported by this browser.";
        }
    }
};
