
/**
 * @name Entities Persist
 * @version 1.9b
 * @author Russell Morley
 * @fileoverview
 * This library adds localstorage persistence to javacript entity (data) objects.
 * @dependencies
 * JQuery >= 1.9.1
 * @copyright
 * Copyright 2015 Compass Point, Inc.
 */
/*
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

if ((typeof CPNS !== 'object') || (CPNS === null)) var CPNS = {};
if ((typeof CPNS.Entities !== 'object') || (CPNS.Entities === null)) CPNS.Entities = {};

//Colection of Entity  ////////////////////////////////////////////////////////////////////////////////
/**
 * EntitiesArray
 * @param key
 * @param fieldsConstructor
 * @returns {CPNS.Entities.EntitiesArray}
 */
CPNS.Entities.EntitiesArray = function(key, fieldsConstructor) {
	this.key_ = key;
	this.fieldsConstructor_ = fieldsConstructor;

	this.children = null; //array of Entity
	
	this.activeChild = null;
};

CPNS.Entities.EntitiesArray.prototype.fill = function() {
	if (!this.children) {
		var childrenString = localStorage.getItem(this.key_);
		if (childrenString) {
			var _children = JSON.parse(childrenString);
			for (var i = 0; i < _children.length; i++) {
				var entity = new CPNS.Entities.Entity;
				_children[i] = jQuery.extend(true, entity, _children[i]);
			}
			this.children = _children;
/*		} else {
			this.children = null;
*/		}
	}
};

CPNS.Entities.EntitiesArray.prototype.display = function() {
	//get the display fields to change
	var tmpChild = new window[this.fieldsConstructor_]();
	var childrenConstructors = tmpChild.CHILDRENCONSTRUCTORS;
	//var uiListContainerElementId = tmpChild.UILISTCONTAINERELEMENTID;
	var uiAddElementId = 'add' + this.fieldsConstructor_.toLowerCase();//tmpChild.UIADDELEMENTID;
	var uiSaveElementId = 'save' + this.fieldsConstructor_.toLowerCase();//tmpChild.UISAVEELEMENTID;
	
	//clear list
//	$('#' + uiListContainerElementId + ' .list .listitem').remove();
	$('#' + this.fieldsConstructor_ + 's .list .listitem').remove();

	//add them to the list
	if (this.children && (this.children.length > 0) ) {
		for (var i=0;i<this.children.length;i++)
		{
//			this.add(this.children[i], uiListContainerElementId, uiAddElementId, uiSaveElementId);
			this.add(this.children[i], this.fieldsConstructor_ + 's', uiAddElementId, uiSaveElementId);
		}
		//var x = $('#' + uiListContainerElementId + ' .list').children().first().html();
		//$('#' + uiListContainerElementId + ' .list').children().first().remove();
	}

	//save handler
	var that = this;
	$("#" + uiSaveElementId).off("click");
	$("#" + uiSaveElementId).on("click", function() {
		//save the entity
		
		if (!that.activeChild.save()) {
			alert('Please enter values for fields highlighted in red before saving.');
			
			return false;
		}

		var entityIsInList = false;
		if (that.children) {
			$.each(that.children, function(i){
			    if(that.children[i].key_ === that.activeChild.key_) {
			    	entityIsInList = true;
			    	that.children[i] = that.activeChild;
					$('#' + that.fieldsConstructor_ + 's').find(".itemid").each(function () {
						if ( $(this).val() == that.activeChild.key_) {
							$(this).siblings('a').html(that.activeChild.displayText);
						}
					});
			    }
			});
		}
		//add to the list if it isn't there already.
		if (!entityIsInList) {
//			that.add(that.activeChild, uiListContainerElementId, uiAddElementId, uiSaveElementId);
			that.add(that.activeChild, that.fieldsConstructor_ + 's', uiAddElementId, uiSaveElementId);
			if (!that.children) {
				that.children = [];
			}
			that.children.push(that.activeChild);
		}
		that.save();
	});

	//add handler
	$("#" + uiAddElementId).off("click");
	$("#" + uiAddElementId).on("click", function() {
		var entityKey = that.key_ + '_' + that.fieldsConstructor_ + CPNS.Entities.generateUniqueString();
		var entityChildren = [];
		if (childrenConstructors) {
			for (var i = 0; i < childrenConstructors.length; i++ ) {
				entityChildren.push(new CPNS.Entities.EntitiesArray(entityKey + '_children_' + childrenConstructors[i] + 's', childrenConstructors[i]));
			}
		}
		that.activeChild = new CPNS.Entities.Entity(entityKey
				, new window[that.fieldsConstructor_]()
				, entityChildren);
		//		, new Array(new EntitiesArray(entityKey + '_pickups', 'pickups', 'addpickup', 'savepickup', FluidPickup)));
		that.activeChild.fill();
		that.activeChild.display();
	});
};


CPNS.Entities.EntitiesArray.prototype.add = function(entity, uiListContainerElementId, uiAddElementId, uiSaveElementId) {
//	var x = $('#' + uiListContainerElementId + ' .list').find('.listitemtemplate');
//	var y = $('#' + uiListContainerElementId + ' .list').html();
	var newListElement = $('#' + uiListContainerElementId + ' .list').find('.listitemtemplate').clone();
	newListElement.appendTo($('#' + uiListContainerElementId + ' .list'));

	newListElement.attr('style', '');
	newListElement.removeClass('listitemtemplate');
	newListElement.addClass('listitem');
	newListElement.find(".selectitem").html(entity.displayText);
	newListElement.find(".itemid").val(entity.key_);
	
	//select entity handler
	var that = this;
	newListElement.find('.selectitem').on("click", function() {
		that.activeChild = entity;
		that.activeChild.fill();
		that.activeChild.display();
	});
	
	newListElement.find('.deleteitem').on("click", function() {
		var r=confirm("Delete?");
		if (r==true)
		{
			newListElement.remove();
			entity.remove();

			if (that.children) {
				for (var i = (that.children.length -1); i >= 0; i--) {
				    if(that.children[i].key_ === entity.key_) 
				    	that.children.splice(i,1);
				}
				if (that.children.length == 0) {
					that.children = null;
				}
			}
			that.save();
		}
		else
		{
		}
	});
};

CPNS.Entities.EntitiesArray.prototype.save = function() {
	if (this.children && (this.children.length > 0)) {
		//var childrenCopy = [];
		for (var i=0;i<this.children.length;i++) {
			this.children[i].empty();
			//childrenCopy.push(this.children[i]);
		}
		localStorage.setItem(this.key_, JSON.stringify(this.children));
	} else {
		localStorage.removeItem(this.key_);
	}
};

CPNS.Entities.EntitiesArray.prototype.empty = function() {
	//this.fields_ = null;
	this.children = null;
	this.activeChild = null;
};

CPNS.Entities.EntitiesArray.prototype.remove = function() {
	if (this.children && (this.children.length > 0)) {
		for (var i=0;i<this.children.length;i++) {
			this.children[i].remove();
		}
	} else {
		this.children = null;
	}
	
	localStorage.removeItem(this.key_);
	//localStorage.removeItem(this.key_ + '_fields);
};







// Enitity ////////////////////////////////////////////////////////////////////////////////
/**
 * Entity
 * @param key
 * @param fields
 * @param children_
 * @returns {CPNS.Entities.Entity}
 */
CPNS.Entities.Entity = function(key, fields, children_) {
	this.key_ = key;
	this.displayText = null;

	this.fields_ = fields;
	this.children = children_; //array of EntityArray
	
	if (this.fields_) {
		this.fieldsType = this.fields_.constructor.name;
	}
};

CPNS.Entities.Entity.prototype.fill = function() {
	if (!this.fields_) {
		var fieldsString = localStorage.getItem(this.key_);
		if (fieldsString) {
			this.fields_ = JSON.parse(fieldsString);
/*		} else {
			this.fields_ = null;
*/	
		}
		var childrenString = localStorage.getItem(this.key_ + '_children');
		if (childrenString) {
			var _children = JSON.parse(childrenString);
			for (var i = 0; i < _children.length; i++) {
				var entityArray = new CPNS.Entities.EntitiesArray;
				_children[i] = jQuery.extend(true, entityArray, _children[i]);
			}
			this.children = _children;
/*		} else {
			this.children = null;
*/
		}
	}
};


CPNS.Entities.Entity.prototype.display = function() {
	if (this.fields_) {
		for (var property in this.fields_) {
		    if (property && this.fields_.hasOwnProperty(property)) {
		        if(this.fields_[property] ) {
		        	$('#' + property).val(this.fields_[property]);
		        } else {
		        	$('#' + property).val('');
		        }
		    }
		}
	}
	
	if (this.children) {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].fill();
			this.children[i].display();
		}
	}
};


CPNS.Entities.Entity.prototype.save = function() {
	var displayTextToSet = '';
	var returnFalse = false;
	$("#" + this.fieldsType + " .displayTextForList").each(function( index ) {
//		console.log( index + ": " + $( this ).text() );
		var displayTextForListElementId = $(this).attr("id");
		if (displayTextForListElementId) {
			var displayTextVal = $(this).val();
			var displayTextValLength = $.trim(displayTextVal).length;
			if (displayTextValLength != 0) {
				if ($.trim(displayTextToSet).length != 0) {
					displayTextToSet += ' - ';
				}
				displayTextToSet += displayTextVal;
			} else {
				returnFalse = true;
				return false;
			}
		}
	});

	if (returnFalse) {
		return false;
	}
	
	if (this.fields_) {
		for (var property in this.fields_) {
		    if (this.fields_.hasOwnProperty(property)) {
		    	if ($('#' + property).val()) {
		    		this.fields_[property] = $('#' + property).val();
		    	} else {
		    		this.fields_[property] = '';
		    	}
		    }
		}

		localStorage.setItem(this.key_, JSON.stringify(this.fields_));
//		var x = this.fields_.constructor;
//		var y = x.name;
//		var displayTextForListElementId = $("#" + this.fields_.constructor.name + " .displayTextForList").attr("Id");
		this.displayText = displayTextToSet;//this.fields_[displayTextForListElementId];
	}
	
	if (this.children && (this.children.length > 0)) {
		//var childrenCopy = JSON.parse(JSON.stringify(this.children));
		for (var i=0;i<this.children.length;i++) {
			this.children[i].empty();
		}
		localStorage.setItem(this.key_ + '_children', JSON.stringify(this.children));
	} else {
		localStorage.removeItem(this.key_ + '_children');
	}
	return true;
};


CPNS.Entities.Entity.prototype.empty = function() {
	this.fields_ = null;
	this.children = null;
};



CPNS.Entities.Entity.prototype.remove = function() {
	if (this.children && (this.children.length > 0)) {
		for (var i=0;i<this.children.length;i++) {
			this.children[i].remove();
		}
	} else {
		this.children = null;
	}

	localStorage.removeItem(this.key_ + '_children');
	localStorage.removeItem(this.key_);
};



//Static utility function
CPNS.Entities.generateUniqueString = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
};


