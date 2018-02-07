/**
 * SmartPathAnalyzer
 */
/*
 * Usage
			var analyzer = new SmartPathAnalyzer(node, (Xpath|Css)Builder);
			var list = analyzer.createPathList();
 */
 class SmartPathAnalyzer {
 	_node;
 	builder;
 	appliedRuleList:Rule[];
 	constructor (_node, builder, appliedRuleList:Rule[]) {
		this._node = _node;
		this.builder = builder;
		this.appliedRuleList = appliedRuleList;
	}
	createPathList (): any [] {
		// Added paths (avoid adding duplicated paths)
		this.addedHidePaths = new Array();
		this.addedSearchPaths = new Array();
		
		var hideOriginalNode = this._node;
		var pathList = new Array();
		while (hideOriginalNode)
		{
			var siblings = CustomBlockerUtil.getSimilarSiblings(hideOriginalNode);
			if (siblings.length>0)
			{
				this.analyzerHideNode(hideOriginalNode, this._node, pathList);
			}
			hideOriginalNode = hideOriginalNode.parentNode;
		}
		return pathList;
	}
	analyzerHideNode (hideOriginalNode:HTMLElement, originalNode:HTMLElement, pathList:any[]) {
		let hidePathSelectors = new PathAnalyzer(hideOriginalNode, this.builder).createPathList();
		for (let i=hidePathSelectors.length-1; i>=0; i--) {
			var hidePathSelector = hidePathSelectors[i];
			if (CustomBlockerUtil.arrayContains(this.addedHidePaths, hidePathSelector.path)) {
				continue;
			}
			this.addedHidePaths.push(hidePathSelector.path);
			
			var hideElements = hidePathSelector.elements;
			var siblingFound = false;
			for (var hideIndex=0; hideIndex<hideElements.length; hideIndex++) {
				if (hideElements[hideIndex]!=hideOriginalNode && hideElements[hideIndex].parentNode==hideOriginalNode.parentNode) {
					siblingFound = true;
				}		
			}
			
			if (hideElements.length>1 && siblingFound)  {
				var searchOriginalNode = originalNode;
				while (CustomBlockerUtil.isContained(searchOriginalNode, hideOriginalNode)) {
					var searchPathSelectors = new PathAnalyzer(searchOriginalNode, this.builder, hideOriginalNode, hidePathSelector.path).createPathList();
					for (let searchIndex=0; searchIndex<searchPathSelectors.length; searchIndex++) {
						var searchPathSelector = searchPathSelectors[searchIndex];
						if (CustomBlockerUtil.arrayContains(this.addedSearchPaths, searchPathSelector.path)) {
							continue;
						}
						if (this.isIncludedInAppliedRules(hidePathSelector, searchPathSelector)) {
							continue;
						}
						this.addedSearchPaths.push(searchPathSelector.path);
						let searchSelectedNodes = searchPathSelector.elements;
						let searchElements = searchPathSelector.elements;
						let containedNode = CustomBlockerUtil.getContainedElements(hideElements, searchElements);
						if (containedNode.length>1) {
						
							pathList.push(new SmartPath(hidePathSelector, searchPathSelector));
						}
					}
					searchOriginalNode = searchOriginalNode.parentNode;
				}
			}		
		}
	}
	isIncludedInAppliedRules (hidePathSelector:string, searchPathSelector:string) {
		if (!this.appliedRuleList) {
			return false;
		}
		for (var i=0; i<this.appliedRuleList.length; i++) {
			var rule = this.appliedRuleList[i];
			if (
				CustomBlockerUtil.arrayEquals(hidePathSelector.elements, rule.hideNodes) && 
				CustomBlockerUtil.arrayEquals(searchPathSelector.elements, rule.searchNodes)
			) {
				return true;
			}
		}
		return false;
	}
 }
var pathCount  = 0;
class SmartPath {
	hidePath;
	searchPath;
	constructor (hidePath, searchPath) {
		this.hidePath = hidePath;
		this.searchPath = searchPath;
	}
}