var XpathBuilder = function()
{
};
XpathBuilder.prototype.getIdExpression = function (elementId)
{
	return 'id("' + elementId + '")';
};
XpathBuilder.prototype.getDescendantSeparator = function ()
{
	return "//";
};
XpathBuilder.prototype.getChildSeparator = function ()
{
	return "/";
};
XpathBuilder.prototype.getMultipleTagNameAndClassNameExpression = function (tagName, className)
{
	return tagName
	+ '[contains(concat(" ",normalize-space(@class)," "),"'
	+ className
	+'")]';
};
XpathBuilder.prototype.getSingleTagNameAndClassNameExpression = function (tagName, className)
{
	return tagName + '[@class="' + className + '"]'
};
XpathBuilder.prototype.createPathFilter = function (_path)
{
	var path = CustomBlockerUtil.trim(_path);
	return new XpathPathFilter(path);
};
var XpathPathFilter = function (path) 
{
	this.path = path;
	this.elements = CustomBlockerUtil.getElementsByXPath(path);
};