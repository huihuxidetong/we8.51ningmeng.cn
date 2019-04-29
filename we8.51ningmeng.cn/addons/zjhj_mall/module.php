<?php

namespace zjhj_mall;

/**
 * 模块示例模块定义
 *
 * @author xluwei
 * @url
 */
use Comodojo\Zip\Zip;

defined('IN_IA') or exit('Access Denied');
require __DIR__ . '/vendor/autoload.php';

class Init
{
    public $src_url;
    public $db_url;

    public $src_file;
    public $db_file;

    public function __construct()
    {
        $version = '2.1.0';
        $this->src_url = "http://cloud.zjhejiang.com/we7/mall/install/{$version}/src.zip";
        $this->db_url = "http://cloud.zjhejiang.com/we7/mall/install/{$version}/db.sql";

        $this->src_file = __DIR__ . "/temp/install/{$version}/src.zip";
        $this->db_file = __DIR__ . "/temp/install/{$version}/db.sql";
    }

    public function render($view, $params = [])
    {
        foreach ($params as $name => $value) {
            $$name = $value;
        }
        require __DIR__ . '/views/' . $view . '.php';
    }

    public function renderJson($data)
    {
        header('application/json');
        if (is_array($data) || is_object($data))
            $data = json_encode($data, JSON_UNESCAPED_UNICODE);
        echo $data;
        exit;
    }

    public function run()
    {
        global $_W;
        $url = $_W['siteroot'] . 'addons/' . $_W['current_module']['name'] . '/core/web/index.php?r=mch/passport/login';

        if (file_exists(__DIR__ . '/core/web/index.php')) {
            $app = getYiiApp();
            $app->session->setName('DBSESSIONID');
            $app->session->set('we7_user', $_W['user']);
            $app->session->set('we7_account', $_W['account']);
            header('Location:' . $url);
            exit;
        }

        if ($_W['ispost']) {
            $timeout = 60 * 30;
            set_time_limit($timeout);
            $core_dir = __DIR__ . '/core';

            if (file_exists($this->src_file))
                $res1 = true;
            else
                $res1 = httpcopy($this->src_url, $this->src_file, $timeout);

            if (file_exists($this->db_file))
                $res2 = true;
            else
                $res2 = httpcopy($this->db_url, $this->db_file, $timeout);
            if ($res1 == false || $res2 == false)
                $this->renderJson([
                    'code' => 1,
                    'msg' => '安装失败，从远程服务器下载文件失败，请检查服务器网络是否正常，网站目录是否有写入权限',
                ]);

            pdo_run("<<<EOF " . file_get_contents($this->db_file) . " EOF;");

            $zip = Zip::open($this->src_file);
            $zip->extract($core_dir);
            $zip->close();

            file_delete($this->src_file);
            file_delete($this->db_file);

            $this->renderJson([
                'code' => 0,
                'msg' => '安装成功，<a href="' . $url . '">开始使用</a>',
            ]);
        } else {
            $this->render('run', [
                'is_admin' => true,
            ]);
        }
    }

}

/**
 * @return \yii\web\Application
 */
function getYiiApp()
{
    if (class_exists('Yii'))
        return \Yii::$app;
    require(__DIR__ . '/core/vendor/autoload.php');
    require(__DIR__ . '/core/vendor/yiisoft/yii2/Yii.php');
    $config = require(__DIR__ . '/core/config/web.php');
    return new \yii\web\Application($config);
}

function httpcopy($url, $file = "", $timeout = 60)
{
    $file = empty($file) ? pathinfo($url, PATHINFO_BASENAME) : $file;
    $dir = pathinfo($file, PATHINFO_DIRNAME);
    !is_dir($dir) && @mkdir($dir, 0755, true);
    $url = str_replace(" ", "%20", $url);

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        $temp = curl_exec($ch);
        if (@file_put_contents($file, $temp) && !curl_error($ch)) {
            return $file;
        } else {
            return false;
        }
    } else {
        $opts = array(
            "http" => array(
                "method" => "GET",
                "header" => "",
                "timeout" => $timeout)
        );
        $context = stream_context_create($opts);
        if (@copy($url, $file, $context)) {
            //$http_response_header
            return $file;
        } else {
            return false;
        }
    }
}

(new Init())->run();
exit;