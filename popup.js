(function(){
	var MAXLEN = 100;
	var isGettingData = false;
	
	$('.filter-txt').on('focus', function(e){
		$(this).val('');
	});

	$('.filter-btn').click(function(e){
		var me = $(this);

		var username = $('.user-name').val();
		var filterTxt = $('.filter-txt').val();
		var type = me.attr('data-type');

		var resObj = localStorage.getItem(encodeURI(type));
		var res = JSON.parse(resObj);

		var url, curObj;
		if(type == 'star'){
			url = 'https://api.github.com/users/'+username+'/starred?per_page='+MAXLEN;

			curObj = {
				user: username,
				type: 'star',
				pageCount: 1,
				allRes: []
			};

		}else if(type == 'repos'){
			url = 'https://api.github.com/users/'+username+'/repos?per_page='+MAXLEN;

			curObj = {
				user: username,
				type: 'repos',
				pageCount: 1,
				allRes: []
			};
		}
		
		$('.time-cost').hide();

		if(resObj == undefined || res.user != username || !res.allRes.length){
			getData(curObj, url);
		}else{
			renderList(res.allRes, filterTxt);
		}
	});
	
	function getData(curObj, url){
		var sTime = Date.now();
		isGettingData = true;

		$('.getting-data').show();
		$('.list-wrap').hide();
		$('.repos-count').hide();

		$.ajax({
			url: url+'&page='+curObj.pageCount,
			type: 'get',
			success: function(res, status, xhr){
			
				if($.isArray(res)){
					$.each(res, function(index, item){
						var tmpObj = processData(item)
						curObj.allRes.push(tmpObj);
					});
					
					if(res.length == MAXLEN){
						curObj.pageCount++;
						getData(curObj, url)
					}else{
						console.log('curObj.pageCount:'+curObj.pageCount)
						console.log('time costs:'+(Date.now() - sTime))
						isGettingData = false;
						$('.time-cost span').html((Date.now() - sTime)+'ms');
						$('.time-cost').show();
						var filterTxt = $('.filter-txt').val();
						renderList(curObj.allRes, filterTxt);
						localStorage.setItem(encodeURI(curObj.type), JSON.stringify(curObj));
					}
				}
			}
		});
	}
	
	function processData(originData){
		var tmpObj = {};
		tmpObj.owner = {};
		tmpObj.name = originData.name;
		tmpObj.url = originData.url;
		tmpObj.owner.login = originData.owner.login;
		tmpObj.owner.url = originData.owner.url;
		return tmpObj;
	}

	function renderOneLi(item){
		var link = item.owner.login+'/'+item.name;
		var linkTxt = item.owner.login + '/' + '<strong>'+item.name+'</strong>';
		return '<li><a href="https://github.com/'+link+'" target="_blank">'+linkTxt+'</a></li>'
	}
	
	function renderList(res, filterTxt){
		var html = '', count = 0;
		filterTxt = filterTxt.toLowerCase();
		$.each(res, function(index, item){
			var name = item.name.toLowerCase();
			if(name.indexOf(filterTxt) != -1){
				html += renderOneLi(item);
				count++;
			}
		});

		$('.getting-data').hide();
		if(count){
			$('.list-wrap ul').html(html)
			$('.list-wrap').show();
		}else{
			$('.list-wrap').hide();
		}
		
		$('.repos-count span').html(count);
		$('.repos-count').show();
 	}

})();
