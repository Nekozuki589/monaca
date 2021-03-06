// This is a JavaScript file

 var module = ons.bootstrap();
        ons.disableAutoStatusBarFill();  // (Monaca enables StatusBar plugin by default)
        
        var images = null;
        $(document).on('pageinit', '#main-page', function() {
            ons.createAlertDialog('loading.html');
            
            var onSuccess = function(pictureUrl) {
                loading.show();

                images = [];
                var $img = $('<img>');
                $img.attr('src', pictureUrl);
                images.push({
                    element: $img,
                    label: '無加工'
                });
                
                $img.one("load", function() {
                  images.push({
                      element: toMonochrome(this),
                      label: 'グレースケール'
                  });
                  images.push({
                      element: toInverse(this),
                      label: 'ネガポジ変換'
                  });
                  loading.hide();
                  myNavi.pushPage('image.html');
                });
            }
            
            $(this).on('click', '.take-from-camera', function() {
                getPictureFromCamera(onSuccess);
            });
            $(this).on('click', '.take-from-gallery', function() {
                getPictureFromGallery(onSuccess);
            });
        });
        
        $(document).on('pageinit', '#image-page', function() {
            images.map(function(image) {
                var element = $('<ons-carousel-item><div class="converted-image-label-wrapper"><div class="converted-image-label"></div></div></ons-carousel-item>');
                $(image.element).addClass('converted-image');
                element.prepend(image.element);
                element.find('.converted-image-label').text(image.label);
                
                return element[0];
            }).forEach(function(element) {
                $('ons-carousel').append(element);
            });
            setTimeout(function() {
                imageCarousel.refresh();
            }, 100);
        });
            
        var convert = function(fn) {
            return function(photoImage) {
                // キャンバスのコンテキストの取得
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                
                // キャンバスの描画サーフェイスのサイズを設定
                $(canvas).attr({
                    width: photoImage.width,
                    height: photoImage.height
                });
                
                // キャンバスに１度、カラー写真を描画する
                context.drawImage(photoImage, 0, 0, photoImage.width, photoImage.height);
                
                // 写真のイメージデータを全部取得する
                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                // イメージのカラーピクセルの入った配列
                var dataArray = imageData.data;
                
                // 1ピクセルめのカラー  [ r1, g1, b1, a1,
                // 2ピクセルめのカラー    r2, g2, b2, a2,
                //                        ...]
        
                try{
                    // 画像データを加工する
                    imageData.dataArray = fn(dataArray);
                } catch (e) {
                    alert('Error: ' + e);
                }
                
                // イメージデータを戻す
                context.putImageData(imageData, 0, 0);
                
                return canvas;
            };
        };
            
        var toMonochrome = convert(function(dataArray) {
            var len = dataArray.length;
                
            // モノクロに変換
            for (var i = 0; i < len; i += 4) {
                var average = (dataArray[i] + dataArray[i + 1] + dataArray[i + 2]) * 0.3333;
                dataArray[i] = average;
                dataArray[i + 1] = average;
                dataArray[i + 2] = average;
            }
            
            return dataArray;
        });
        
        var toInverse = convert(function(dataArray) {
            var len = dataArray.length;
                
            // ネガポジ変換
            for (var i = 0; i < len; i += 4) {
                dataArray[i]= -dataArray[i] + 255;
                dataArray[i + 1]= -dataArray[i + 1] + 255;
                dataArray[i + 2]= -dataArray[i + 2] + 255;
            }
            
            return dataArray;
        });
            
        // ギャラリーから画像のパスを取得する
        var getPictureFromGallery = function(onSuccess) {
            var options = {
                quality: 50,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: Camera.DestinationType.FILE_URI
            };
            
            navigator.camera.getPicture(function(imageURI) {
                onSuccess(imageURI);
            }, onFail, options);
        };
        
          
        // 写真を撮影して保存する
        var getPictureFromCamera = function(onSuccess) {
        
            // デバイスのカメラアプリを利用して撮影し保存
            var options = {
                sourceType : Camera.PictureSourceType.CAMERA,
                saveToPhotoAlbum: true,
                correctOrientation:true,
                destinationType: Camera.DestinationType.FILE_URI 
            };
            
            // カメラアプリを起動し、撮影して保存
            navigator.camera.getPicture(function(imageURI) {
                onSuccess(imageURI);
            }, onFail, options);
        };
        
        function onFail() {
            console.log("写真を取得できませんでした")
        }