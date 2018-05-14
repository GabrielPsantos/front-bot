(function () {
    var Message;
    const userId = makeid();

    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, message_side, sendMessage,enviaRequisicao,buscaReceita;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text,side) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = side === 'r' ? 'right' : 'left';
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        enviaRequisicao = function(msg){
            var data = { "inputdata" : msg};
            let config = {
                headers: { "userid" : userId}
            }
            axios.post('https://tbypr10uv6.execute-api.us-east-1.amazonaws.com/Dev/sendmessage',data, config).then((response) => {
                var message = response.data.message;
                var matches = (IsJsonString(message)) ? JSON.parse(message).matches : null;
                var messageMatches = "These are the best possible choices found, according to our conversation : <br>";
                
                if(matches){
                    if(matches.length > 0){
                        for(var x = 0;x < matches.length ; x++){
                            messageMatches += "<a href='#' class='link-receita' onclick='return false' data-id-receita=" + matches[x].id +  ">" + matches[x].recipeName + "</a> <br>"    
                        }
                        messageMatches = messageMatches;

                        console.log(matches);
                        sendMessage(messageMatches,"r");
                    }else{
                        sendMessage("Sorry, but i couldn't find any recipe that fit to our conversation requirements","r");
                    }
                    sendMessage("Can I help you with some other dishes, drinks and desserts?","r");
                }else{
                    console.log(message);
                    sendMessage(message,"r");
                }
            })
            .catch((error) => {
                console.log(error);
            });
        };
        buscaReceita = function(recipeId){
            axios.get('http://api.yummly.com/v1/api/recipe/'+recipeId+'?_app_id=bc121501&_app_key=1e30aefaf42b20b97777c59020be3400')
            .then((response) =>{
                var campos = response.data;
                console.log(campos);
                var imagem = campos.images[0].hostedLargeUrl;
                var Ingredientes = campos.ingredientLines;
                for(var x = 0;x<Ingredientes.length;x++){
                    $('#ingredientLines').append("<li>" + Ingredientes[x] + "</li>")
                }
                $('#totalTime').html(campos.totalTime);
                $('#numbersofServing').html(campos.numberOfServings)
                $('#recipeImg').attr('src',imagem)
                $('#headerReceita').html(campos.name);
                $('#sourceName').html(campos.source.sourceDisplayName);
                $('#sourceUrl').attr('href',campos.source.sourceRecipeUrl);
                $('#rating').html(campos.rating);
                $('#myModal').modal('show');
            })
            .catch((error)=>{
                console.log(error);
            });
        }


        $('body').on('click','.link-receita',function(e){
            buscaReceita($(this).data('id-receita'));
        });
        
        $('.send_message').click(function (e) {
            enviaRequisicao(getMessageText());
            return sendMessage(getMessageText(),"l");
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                enviaRequisicao(getMessageText());
                return sendMessage(getMessageText(),"l");
            }
        });
        sendMessage("Welcome to FoodBot !","r");
        sendMessage("What do you want to prepare today? I can help you on dishes, drinks and desserts!","r");
    });
}.call(this));


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    console.log("is json");
    return true;
}

